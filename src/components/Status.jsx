import React, { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Check, Clock3, Globe2, Heart, Server, WifiOff } from 'lucide-react';
import '../styles/status.css';

function tempoOnline(since, now) {
  if (!since) return 'Aguardando verificação';
  const minutes = Math.max(0, Math.floor((now - Date.parse(since)) / 60000));
  const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), mins = minutes % 60;
  if (days) return `${days}d ${hours}h ${mins}min`;
  if (hours) return `${hours}h ${mins}min`;
  return `${mins} min`;
}
const day = new Intl.DateTimeFormat('pt-BR', { timeZone:'UTC', day:'numeric', month:'long', year:'numeric' });
export default function Status() {
  const [period,setPeriod]=useState('dia');
  const [data,setData]=useState(null); const [error,setError]=useState(false); const [tick,setTick]=useState(Date.now());
  useEffect(()=>{
    document.title='Status dos serviços | DuskVale'; let alive=true;
    async function load(){try { const response=await fetch('/status-data.json',{cache:'no-store'}); if(!response.ok) throw Error(); const value=await response.json(); if(!Array.isArray(value.services)) throw Error(); if(alive){setData(value);setError(false);} }catch{if(alive)setError(true);}}
    load(); const timer=setInterval(()=>{setTick(Date.now());load();},30000);
    return ()=>{alive=false;clearInterval(timer)};
  },[]);
  const stale=data && tick - Date.parse(data.updatedAt)>180000;
  const unknown=!data || error || stale;
  const down=!unknown && data.services.some(s=>!s.online);
  const subtitle=unknown?'Não foi possível confirmar o estado atual.':down?'Alguns serviços estão indisponíveis. Nossa equipe pode verificar a situação.':'Tudo pronto para sua próxima aventura.';
  return <main className="status-page"><div className="status-shell">
    <header className="status-nav"><a className="status-brand" href="https://duskvale.com.br/">DUSK<span>VALE</span><i>✿</i></a><a href="https://duskvale.com.br/" className="status-back">Voltar ao site <ArrowUpRight size={15}/></a></header>
    <section className="status-hero"><div className="status-eyebrow"><span/> ACOMPANHAMENTO EM TEMPO REAL</div><h1>Seu cantinho,<br/><em>sempre por perto.</em></h1><p>Acompanhe a disponibilidade do DuskVale e saiba como estão nossos serviços.</p><div className="status-meta"><Clock3 size={15}/> Atualização automática a cada minuto <b>✦</b> Horário de Brasília</div><span className="status-flower">✿</span></section>
    <section className={'status-banner '+(unknown?'unknown':down?'down':'up')} role="status"><div className="status-banner-icon">{unknown?<Activity/>:down?<WifiOff/>:<Check/>}</div><div><h2>{unknown?'Status indisponível':down?'Atenção aos serviços':'Tudo funcionando por aqui'}</h2><p>{subtitle}</p></div></section>
    <div className="status-heading"><div><span>MONITORAMENTO DUSKVALE</span><h2>Como estão os serviços <i>✦</i></h2></div><p>ÚLTIMOS 90 DIAS</p></div>
    <section className="status-card" aria-label="Disponibilidade dos serviços">{(data?.services || [{id:'survival',name:'Survival'},{id:'lobby',name:'Lobby'},{id:'site',name:'Site DuskVale'}]).map(s=>{
      const state=unknown?'unknown':s.online?'up':'down'; const text=state==='unknown'?'Sem dados':state==='up'?'Operacional':'Offline';
      return <article className="status-service" key={s.id}><div className="status-service-head"><div className="status-name"><span className="status-service-icon">{s.id==='site'?<Globe2 size={19}/>:<Server size={19}/>}</span><div><h3>{s.name}</h3><p>{s.id==='site'?'Website oficial':'Servidor Minecraft'}</p></div></div><div className={'status-state '+state}><i/>{text}</div></div>
      <div className="status-bars" aria-label={`Histórico de ${s.name}`}>{(s.days || Array.from({length:90},(_,i)=>({date:String(i),uptime:null}))).map(d=><span key={d.date} className={d.uptime===null?'empty':d.uptime===100?'up':d.uptime===0?'down':'partial'} title={d.uptime===null?'Sem dados':`${day.format(new Date(d.date+'T12:00:00Z'))}: ${d.uptime}% das verificações bem-sucedidas`} />)}</div>
      <div className="status-history"><span>{state === 'up' ? `Online há pelo menos ${tempoOnline(s.onlineSince, tick)}` : state === 'down' ? 'Serviço offline' : 'Tempo online indisponível'}</span><span>{s.uptime==null?'Aguardando histórico':`${s.uptime.toFixed(2).replace('.',',')}% das verificações`}</span><span>Hoje</span></div>
      {state==='down'&&<p className="status-alert">O serviço está offline. Nossa equipe pode verificar a situação.</p>}</article>})}</section>
    <div className="status-heading status-metrics-heading"><div><span>ACOMPANHE O DESEMPENHO</span><h2>Tempo de resposta <i>✦</i></h2></div><div className="status-period" aria-label="Período dos gráficos">{[['dia','Dia'],['semana','Semana'],['mes','Mês']].map(([key,label])=><button key={key} type="button" aria-pressed={period===key} onClick={()=>setPeriod(key)}>{label}</button>)}</div></div>
    <section className="status-charts" aria-label="Gráficos de tempo de resposta">{['survival','lobby'].map(id=>{
      const service=data?.services?.find(item=>item.id===id); const duration={dia:86400000,semana:604800000,mes:2592000000}[period]; const bucket={dia:300000,semana:3600000,mes:21600000}[period]; const end=Math.ceil(tick/bucket)*bucket; const start=end-duration;
      const samples=unknown?[]:(service?.latencyHistory?.[period]||[]).filter(p=>p.at>=start&&p.at<=end); const valid=samples.filter(p=>p.ms!=null); const max=Math.max(10,...valid.map(p=>p.ms))*1.2;
      let paths=[], current=[]; samples.forEach((p,i)=>{if(p.ms==null||(i&&p.at-samples[i-1].at>bucket*1.5)){if(current.length)paths.push(current.join(' '));current=[];} if(p.ms!=null)current.push(`${((p.at-start)/duration*100).toFixed(2)},${(90-p.ms/max*75).toFixed(2)}`)}); if(current.length)paths.push(current.join(' '));
      const last=valid.at(-1); const formatTime=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',...(period==='dia'?{hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'short'})});
      return <article className="status-chart" key={id}><div className="status-chart-head"><div><h3>{id==='survival'?'Survival':'Lobby'}</h3><p>Tempo de resposta · milissegundos</p></div><strong>{last?`${Math.round(last.ms)} ms`:'Sem dados'}</strong></div>{valid.length?<><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Gráfico de tempo de resposta do ${id==='survival'?'Survival':'Lobby'}`}><line x1="0" y1="15" x2="100" y2="15"/><line x1="0" y1="52.5" x2="100" y2="52.5"/><line x1="0" y1="90" x2="100" y2="90"/>{paths.map((points,i)=><polyline key={i} points={points} />)}{valid.length===1&&<circle cx={(valid[0].at-start)/duration*100} cy={90-valid[0].ms/max*75} r="1.2"/>}</svg><div className="status-chart-axis"><span>{formatTime.format(new Date(start))}</span><span>{formatTime.format(new Date(end))}</span></div></>:<div className="status-chart-empty">Ainda não há medições para este período.</div>}</article>;
    })}</section>
    <footer className="status-footer"><span>Feito com <Heart size={13} fill="currentColor"/> para nossa comunidade</span><a href="https://discord.gg/J8ay8fNtux">Precisa de ajuda? Discord <ArrowUpRight size={14}/></a></footer>
  </div></main>;
}
