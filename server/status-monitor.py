#!/usr/bin/env python3
import datetime, json, os, socket, sqlite3, struct, tempfile, time, urllib.request
from zoneinfo import ZoneInfo

BASE='/var/lib/duskvale-status'
OUTPUT='/opt/app/site-duskvale/dist/status-data.json'
os.makedirs(BASE, exist_ok=True)
db=sqlite3.connect(BASE+'/status.sqlite3')
db.execute('CREATE TABLE IF NOT EXISTS checks (service TEXT NOT NULL, at INTEGER NOT NULL, ok INTEGER NOT NULL, latency REAL)')
db.execute('CREATE INDEX IF NOT EXISTS checks_service_at ON checks(service,at)')
db.commit()
tz=ZoneInfo('America/Sao_Paulo')
def varint(i):
    out=bytearray()
    while True:
        b=i&127; i >>= 7; out.append(b | (128 if i else 0))
        if not i: return bytes(out)
def readvar(sock):
    value=0
    for n in range(5):
        b=sock.recv(1)
        if not b: raise EOFError()
        value|=(b[0]&127)<<(7*n)
        if not b[0]&128: return value
    raise ValueError('varint inválido')
def mc(port):
    start=time.monotonic()
    with socket.create_connection(('127.0.0.1',port),timeout=3) as s:
        s.settimeout(3); host=b'localhost'
        data=b'\x00'+varint(767)+varint(len(host))+host+struct.pack('>H',port)+b'\x01'
        s.sendall(varint(len(data))+data+b'\x01\x00')
        size=readvar(s)
        if size>1048576 or readvar(s)!=0: raise ValueError('resposta inválida')
        length=readvar(s)
        if length>1048576: raise ValueError('resposta longa')
        data=b''
        while len(data)<length:
            part=s.recv(length-len(data))
            if not part: raise EOFError()
            data+=part
        json.loads(data)
    return round((time.monotonic()-start)*1000)
def website():
    start=time.monotonic()
    req=urllib.request.Request('https://duskvale.com.br/',headers={'User-Agent':'DuskValeStatus/1.0'})
    with urllib.request.urlopen(req,timeout=8) as res:
        if res.status!=200: raise ValueError('HTTP')
    return round((time.monotonic()-start)*1000)
def run():
    now=int(time.time())
    for name, check in [('survival',lambda:mc(25567)),('lobby',lambda:mc(25566)),('site',website)]:
        try: latency=check(); ok=1
        except Exception: latency=None; ok=0
        db.execute('INSERT INTO checks VALUES (?,?,?,?)',(name,now,ok,latency))
    db.execute('DELETE FROM checks WHERE at < ?', (now-100*86400,)); db.commit()
    today=datetime.datetime.now(tz).date()
    result={'updatedAt':datetime.datetime.fromtimestamp(now,datetime.timezone.utc).isoformat(),'services':[]}
    for name,label in [('survival','Survival'),('lobby','Lobby'),('site','Site DuskVale')]:
        rows=db.execute('SELECT at,ok,latency FROM checks WHERE service=? AND at>=? ORDER BY at',(name,now-91*86400)).fetchall()
        per={}
        for at,ok,lat in rows:
            day=datetime.datetime.fromtimestamp(at,tz).date().isoformat()
            total,success=per.get(day,(0,0)); per[day]=(total+1,success+ok)
        days=[]
        for offset in range(89,-1,-1):
            day=(today-datetime.timedelta(days=offset)).isoformat(); counts=per.get(day)
            days.append({'date':day,'checks':counts[0] if counts else 0,'uptime':round(100*counts[1]/counts[0],2) if counts else None})
        last=rows[-1] if rows else None
        since = None
        if last and last[1]:
            since = last[0]
            for previous in reversed(rows[:-1]):
                if not previous[1] or since - previous[0] > 150: break
                since = previous[0]
        samples=[r for r in rows if datetime.datetime.fromtimestamp(r[0],tz).date()>=today-datetime.timedelta(days=89)]
        latency_history = {}
        if name in ('survival', 'lobby'):
            for key, duration, bucket in [('dia',86400,300),('semana',604800,3600),('mes',2592000,21600)]:
                groups = db.execute('SELECT CAST(at / ? AS INTEGER) * ?, AVG(CASE WHEN ok = 1 THEN latency END) FROM checks WHERE service = ? AND at >= ? GROUP BY CAST(at / ? AS INTEGER) ORDER BY 1', (bucket,bucket,name,now-duration,bucket)).fetchall()
                latency_history[key] = [{'at':t*1000,'ms':round(ms,1) if ms is not None else None} for t,ms in groups]
        result['services'].append({'id':name,'name':label,'online':bool(last[1]) if last else None,'checkedAt':datetime.datetime.fromtimestamp(last[0],datetime.timezone.utc).isoformat() if last else None,'latencyMs':last[2] if last else None,'onlineSince':datetime.datetime.fromtimestamp(since,datetime.timezone.utc).isoformat() if since is not None else None,'latencyHistory':latency_history,'uptime':round(100*sum(r[1] for r in samples)/len(samples),2) if samples else None,'days':days})
    fd,tmp=tempfile.mkstemp(prefix='.status-',dir=os.path.dirname(OUTPUT))
    with os.fdopen(fd,'w') as f: json.dump(result,f,ensure_ascii=False)
    os.chmod(tmp,0o644); os.replace(tmp,OUTPUT)
while True:
    started=time.monotonic()
    try: run()
    except Exception as e: print('Erro no monitor:',repr(e),flush=True)
    time.sleep(max(1,60-(time.monotonic()-started)))
