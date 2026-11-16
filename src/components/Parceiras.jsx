import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import '../styles/parceiras.css';

function Parceiro({ item }) {
  const [falhou, setFalhou] = useState(false);
  return <a className="partner-card" href={item.link} target="_blank" rel="noopener noreferrer">
    <div className="partner-avatar">{item.imagem && !falhou ? <img src={item.imagem} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFalhou(true)} /> : <span>{Array.from(item.nome.trim())[0]?.toLocaleUpperCase('pt-BR') || '✿'}</span>}</div>
    <div className="partner-info"><span>PARCERIA DUSKVALE</span><h2>{item.nome}</h2><p>Conhecer parceria <ArrowUpRight size={14} /></p></div><ArrowUpRight className="partner-arrow" size={18}/>
  </a>;
}
export default function Parceiras() {
  const [parceiros,setParceiros]=useState([]); const [estado,setEstado]=useState('carregando');
  useEffect(()=>{document.title='Parceiras | DuskVale';const controller=new AbortController(); async function carregar(){try{const r=await fetch('/parcerias-publico',{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const dados=await r.json();if(!Array.isArray(dados.parceiros))throw Error();setParceiros(dados.parceiros.filter(p=>p.nome&&p.link));setEstado('pronto')}catch(e){if(e.name!=='AbortError')setEstado('erro')}}carregar();const timer=setInterval(carregar,30000);return()=>{controller.abort();clearInterval(timer)}},[]);
  return <main className="partners-page"><div className="partners-shell">
    <header className="partners-nav"><a className="partners-brand" href="/">DUSK<span>VALE</span><i>✿</i></a><a className="partners-back" href="/"><ArrowLeft size={15}/> Voltar ao início</a></header>
    <section className="partners-hero"><div className="partners-eyebrow"><span/> JUNTOS FLORESCEMOS <Sparkles size={13}/></div><h1>Boas histórias são<br/><em>melhores juntas.</em></h1><p>Conheça as comunidades e pessoas que caminham junto com o DuskVale e ajudam nosso mundo a florescer.</p><span className="partners-flower" aria-hidden="true">✿</span></section>
    <section aria-labelledby="partners-title"><div className="partners-heading"><div><span>NOSSA COMUNIDADE</span><h2 id="partners-title">Nossas parcerias <i>✦</i></h2></div><span>{estado==='pronto'?`${String(parceiros.length).padStart(2,'0')} PARCERIAS`:''}</span></div>
      {estado==='carregando'&&<div className="partners-empty">Carregando parcerias...</div>}
      {estado==='erro'&&<div className="partners-empty" role="status">Não foi possível carregar as parcerias agora. Tente novamente em instantes.</div>}
      {estado==='pronto'&&parceiros.length===0&&<div className="partners-empty"><span>✿</span><h3>Novas conexões estão florescendo.</h3><p>Em breve, você encontrará nossas parcerias por aqui.</p></div>}
      {estado==='pronto'&&parceiros.length>0&&<div className="partners-grid">{parceiros.map(p=><Parceiro key={`${p.nome}-${p.link}`} item={p}/>)}</div>}
    </section><footer className="partners-footer"><span>Feito com <Heart size={13} fill="currentColor"/> para nossa comunidade</span><a href="https://discord.gg/J8ay8fNtux" target="_blank" rel="noopener noreferrer">Fale com a gente <ArrowUpRight size={14}/></a></footer>
  </div></main>;
}
