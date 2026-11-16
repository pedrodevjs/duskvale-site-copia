#!/usr/bin/env python3
import hmac, json, os, re, socketserver, sqlite3, time, uuid
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit

SOCKET='/opt/app/site-duskvale/parcerias-api.sock'
DB='/var/lib/duskvale-parcerias/parcerias.sqlite3'
TOKEN=os.environ['DUSKVALE_API_TOKEN']
if len(TOKEN) < 32: raise RuntimeError('Token da API inválido')

def connect():
    db=sqlite3.connect(DB, timeout=5)
    db.execute('CREATE TABLE IF NOT EXISTS partners (id TEXT PRIMARY KEY, nome TEXT NOT NULL, link TEXT NOT NULL, imagem TEXT, criado_em INTEGER NOT NULL)')
    return db

def valid_url(value):
    if not isinstance(value,str) or len(value)>2048 or any(ord(c)<32 for c in value): return False
    try:
        parsed=urlsplit(value)
        return parsed.scheme in ('http','https') and bool(parsed.hostname) and parsed.username is None and parsed.password is None
    except ValueError: return False

class Handler(BaseHTTPRequestHandler):
    def reply(self,status,data):
        body=json.dumps(data,ensure_ascii=False).encode('utf-8'); self.send_response(status); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def unauthorized(self):
        if self.command == 'GET' and 'text/html' in self.headers.get('Accept', ''):
            self.send_response(302); self.send_header('Location','/'); self.send_header('Cache-Control','no-store'); self.send_header('Content-Length','0'); self.end_headers(); return
        self.reply(401,{'erro':'Não autorizado'})
    def do_GET(self):
        if self.path not in ('/api/getpartner','/parcerias-publico'): return self.reply(404,{'erro':'Rota inexistente'})
        if self.path == '/api/getpartner' and not hmac.compare_digest(self.headers.get('Authorization',''), 'Bearer '+TOKEN): return self.unauthorized()
        with connect() as db: rows=db.execute('SELECT id,nome,link,imagem FROM partners ORDER BY nome COLLATE NOCASE, id').fetchall()
        if self.path == '/parcerias-publico':
            self.reply(200,{'parceiros':[dict(zip(('nome','link','imagem'),r[1:])) for r in rows]})
        else:
            self.reply(200,{'parceiros':[dict(zip(('id','nome','link','imagem'),r)) for r in rows]})
    def do_POST(self):
        if self.path not in ('/api/addpartner','/api/removepartner'): return self.reply(404,{'erro':'Rota inexistente'})
        if not hmac.compare_digest(self.headers.get('Authorization',''), 'Bearer '+TOKEN): return self.unauthorized()
        try:
            length=int(self.headers.get('Content-Length','-1'))
            if length<0 or length>8192: return self.reply(413,{'erro':'Conteúdo muito grande'})
            data=json.loads(self.rfile.read(length))
            if not isinstance(data,dict): raise ValueError()
        except (ValueError,UnicodeDecodeError): return self.reply(400,{'erro':'JSON inválido'})
        if self.path.endswith('addpartner'):
            nome=data.get('nome'); link=data.get('link'); imagem=data.get('imagem') or None
            if not isinstance(nome,str) or not 1<=len(nome.strip())<=80 or any(ord(c)<32 for c in nome): return self.reply(400,{'erro':'Nome deve ter de 1 a 80 caracteres'})
            if not valid_url(link) or (imagem is not None and not valid_url(imagem)): return self.reply(400,{'erro':'Link e imagem devem ser URLs HTTP ou HTTPS válidas'})
            partner={'id':str(uuid.uuid4()),'nome':nome.strip(),'link':link,'imagem':imagem}
            with connect() as db: db.execute('INSERT INTO partners VALUES (?,?,?,?,?)',(*partner.values(),int(time.time())))
            return self.reply(201,partner)
        ident=data.get('id')
        if not isinstance(ident,str) or not re.fullmatch(r'[a-f0-9-]{36}',ident): return self.reply(400,{'erro':'Informe o id do parceiro'})
        with connect() as db: deleted=db.execute('DELETE FROM partners WHERE id=?',(ident,)).rowcount
        return self.reply(200,{'removido':True}) if deleted else self.reply(404,{'erro':'Parceiro não encontrado'})
    def log_message(self,fmt,*args): pass
class Server(socketserver.ThreadingMixIn,socketserver.UnixStreamServer): daemon_threads=True
if __name__=='__main__':
    if os.path.exists(SOCKET): os.unlink(SOCKET)
    with Server(SOCKET,Handler) as server:
        os.chmod(SOCKET,0o666); server.serve_forever()
