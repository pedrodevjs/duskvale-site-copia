import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Home, Store, Package, Sparkles, Heart, Clock3 } from 'lucide-react';
import '../styles/beneficios.css';

const planos = [
  { id:'broto', nome:'Broto', simbolo:'🌱', frase:'O começo de uma aventura especial.', preco:'5.000', casas:4, lojas:2, material:'ferro', ferro:32, ouro:16, diamantes:4, esmeraldas:8 },
  { id:'sakura', nome:'Sakura', simbolo:'🌸', frase:'Mais espaço para florescer.', preco:'10.000', casas:6, lojas:3, material:'diamante', ferro:48, ouro:24, diamantes:6, esmeraldas:12 },
  { id:'encantado', nome:'Encantado', simbolo:'✨', frase:'Um toque de magia na jornada.', preco:'20.000', casas:8, lojas:4, material:'diamante', ferro:64, ouro:32, diamantes:8, esmeraldas:16, encanto:'I' },
  { id:'estelar', nome:'Estelar', simbolo:'⭐', frase:'Para alcançar novos horizontes.', preco:'40.000', casas:10, lojas:5, material:'diamante', ferro:96, ouro:48, diamantes:12, esmeraldas:24, encanto:'II', extra:true },
];

function Plano({ plano, numero }) {
  const p = plano;
  const reduced = useReducedMotion();
  return <motion.article initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -30px 0px" }} whileHover={reduced ? undefined : { y: -5 }} transition={{ duration: 0.35 }} className={`vip-card vip-card-${p.id}`} id={p.id}>
    <div className="vip-card-top"><span className="vip-card-number">PLANO 0{numero}</span><span className="vip-card-icon" aria-hidden="true">{p.simbolo}</span></div>
    <p className="vip-overline">VIP DUSKVALE</p><h3>{p.nome}</h3><p className="vip-card-desc">{p.frase}</p>
    <div className="vip-price"><strong>{p.preco}</strong><span> Pétalas <small>/ mês</small></span></div>
    <div className="vip-card-divider" />
    <div className="vip-quick"><span><Home size={15} aria-hidden="true" /><b>{p.casas}</b> casas</span><span><Store size={15} aria-hidden="true" /><b>{p.lojas}</b> locais de loja</span></div>
    <div className="vip-kit-label"><Package size={15} aria-hidden="true" /> KIT A CADA COMPRA OU RENOVAÇÃO</div>
    <ul className="vip-list">
      <li><Check size={15} aria-hidden="true" /><span>Armadura completa de {p.material}: capacete, peitoral, calças e botas{p.encanto ? ` com Proteção ${p.encanto}` : ''}.</span></li>
      <li><Check size={15} aria-hidden="true" /><span>Espada de {p.material}{p.encanto ? ` com Afiação ${p.encanto}` : ''}.</span></li>
      <li><Check size={15} aria-hidden="true" /><span>Picareta, machado e pá de {p.material}{p.encanto ? ` com Eficiência ${p.encanto}` : ''}.</span></li>
      <li><Check size={15} aria-hidden="true" /><span>{p.ferro} barras de ferro e {p.ouro} barras de ouro.</span></li>
      <li><Check size={15} aria-hidden="true" /><span>{p.diamantes} diamantes e {p.esmeraldas} esmeraldas.</span></li>
      <li><Check size={15} aria-hidden="true" /><span>Uma caixa de shulker com o kit{p.extra ? ' e uma caixa de shulker vazia adicional' : ''}.</span></li>
    </ul>
    <p className="vip-tag">✦ &nbsp; Tag [{p.nome}] no servidor</p>
  </motion.article>;
}

export default function Beneficios() {
  useEffect(() => { document.title = 'Benefícios VIP | DuskVale'; }, []);
  return <main className="vip-page"><div className="vip-glow" aria-hidden="true" /><div className="vip-shell">
    <header className="vip-nav"><Link className="vip-brand" to="/" aria-label="DuskVale, página inicial">DUSK<span>VALE</span><i>✿</i></Link><nav aria-label="Navegação"><Link to="/ajuda">Central de ajuda</Link><Link to="/"><ArrowLeft size={15} aria-hidden="true" /> Início</Link></nav></header>
    <section className="vip-hero"><div className="vip-hero-copy"><div className="vip-kicker"><span /> UM MUNDO DE POSSIBILIDADES ✦</div><h1>Seu cantinho para <em>florescer.</em></h1><p>Escolha o VIP que combina com sua jornada e descubra tudo o que cada plano oferece no DuskVale.</p><div className="vip-hero-actions"><a href="#planos" className="vip-primary">Conhecer os planos <ArrowRight size={16} aria-hidden="true" /></a><a href="#como-funciona" className="vip-secondary">Como funciona ↓</a></div><div className="vip-hero-note"><Sparkles size={15} aria-hidden="true" /> Disponível para Java e Bedrock</div></div><div className="vip-art" aria-hidden="true"><div className="vip-art-ring vip-ring-one" /><div className="vip-art-ring vip-ring-two" /><span className="vip-art-star star-one">✦</span><span className="vip-art-star star-two">✧</span><span className="vip-art-flower">✿</span><div className="vip-art-label">DUSKVALE <span>VIP CLUB</span></div></div></section>
    <section className="vip-plans" id="planos"><div className="vip-section-head"><div><span className="vip-kicker-text">ENCONTRE O SEU LUGAR</span><h2>Um plano para cada jornada<span>.</span></h2><p>Compare todos os benefícios e escolha com calma. Os valores são em Pétalas do servidor.</p></div><div className="vip-plan-count">04 <span>PLANOS</span></div></div><div className="vip-grid">{planos.map((p,i)=><Plano key={p.id} plano={p} numero={i+1} />)}</div><p className="vip-footnote">Casas são pontos de teleporte marcados com <code>/sethome</code>. Os locais de loja são endereços cadastrados com <code>/criarloja</code>; cada local pode ter várias placas de produtos.</p></section>
    <section className="vip-how" id="como-funciona"><div className="vip-section-head"><div><span className="vip-kicker-text">SIMPLES ASSIM</span><h2>Como funciona<span>?</span></h2><p>O que você precisa saber antes de escolher seu VIP.</p></div></div><div className="vip-how-grid"><article><span>01</span><h3>Escolha seu plano</h3><p>No jogo, use <code>/comprarvip</code>, escolha seu VIP e confirme. O valor é descontado do seu saldo de Pétalas. Consulte-o com <code>/saldo</code>.</p></article><article><span>02</span><h3>Receba seu kit</h3><p>A caixa é entregue automaticamente após a compra ou renovação, enquanto você estiver conectado e houver espaço livre no inventário.</p></article><article><span>03</span><h3>Acompanhe o prazo</h3><p>Use <code>/vipinfo</code> para ver o plano, o vencimento e a situação da renovação. O vencimento acompanha o mesmo dia do mês; quando não existir, usa o último dia.</p></article></div><div className="vip-rules"><div><Clock3 size={19} aria-hidden="true" /><h3>Renovação automática</h3><p>Começa desativada. Use <code>/renovacaoauto ligar</code> para ativar ou <code>/renovacaoauto desligar</code> para parar. Sem saldo suficiente no vencimento, o VIP expira sem cobrança.</p></div><div><Sparkles size={19} aria-hidden="true" /><h3>Upgrade de plano</h3><p>Você pode comprar um plano superior pelo valor integral. O novo prazo começa na compra, substitui o anterior e o novo kit fica disponível após dois dias. Ative novamente a renovação automática se desejar.</p></div></div><div className="vip-booster"><Heart size={19} aria-hidden="true" /><div><strong>E o Booster do Discord?</strong><p>O benefício para quem impulsiona o Discord está planejado. A integração automática com o Discord ainda será criada e o Booster não é vendido em <code>/comprarvip</code>.</p></div></div></section>
    <footer className="vip-footer"><span>✿ &nbsp; Um mundo feito para florescer.</span><div><Link to="/ajuda">Central de ajuda ↗</Link><Link to="/atualizacoes">Atualizações ↗</Link></div></footer>
  </div></main>;
}
