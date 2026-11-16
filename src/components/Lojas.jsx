import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Check, Copy, MapPin, Search, ShoppingBag, Sparkles } from 'lucide-react';
import '../styles/ajuda.css';
import '../styles/lojas.css';

export default function Lojas() {
  const reduced = useReducedMotion();
  const [shops, setShops] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');
  useEffect(() => {
    document.title = 'Lojas dos jogadores | DuskVale';
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/lojas', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('API indisponível');
        const data = await response.json();
        if (!Array.isArray(data.lojas)) throw new Error('Resposta inválida');
        setShops(data.lojas); setError(false);
      } catch (err) { if (err.name !== 'AbortError') setError(true); }
    }
    load(); const timer = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  const results = useMemo(() => (shops || []).filter((s) => `${s.nome} ${s.jogador} ${s.mundo}`.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))), [shops, query]);
  async function copy(shop) {
    try { await navigator.clipboard.writeText(shop.comando); setCopied(shop.id); setTimeout(() => setCopied(''), 2500); }
    catch { setCopied('erro:' + shop.id); }
  }
  return <main className="help-page shops-page"><div className="help-glow" aria-hidden="true" /><div className="help-shell">
    <header className="help-nav"><Link className="help-brand" to="/">DUSK<span>VALE</span><i>✿</i></Link><nav className="help-nav-links" aria-label="Navegação"><Link to="/ajuda">Central de ajuda</Link><Link to="/atualizacoes">Atualizações</Link><Link className="help-back" to="/"><ArrowLeft size={15} /> Início</Link></nav></header>
    <section className="help-hero shops-hero"><div className="help-kicker"><span /> FEITO PELA COMUNIDADE <span className="help-sparkle">✦</span></div><h1>Descubra as <span>lojinhas</span></h1><p>Encontre as lojas dos jogadores, copie o comando e visite os cantinhos criados pela comunidade no Survival. 🌸</p><label className="help-search"><Search size={20} aria-hidden="true"/><span className="sr-only">Buscar lojas ou jogadores</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Busque uma loja, jogador ou mundo..." /></label><div className="help-hero-flower" aria-hidden="true">✿</div></section>
    <section className="shops-content"><div className="shops-heading"><div><div className="help-kicker shops-kicker"><span /> DIRETÓRIO DO SURVIVAL</div><h2>Um passeio pelas lojas <Sparkles size={20} aria-hidden="true"/></h2><p>Cadastros atualizados automaticamente a partir do servidor.</p></div><div className="shops-count">{shops === null ? 'Carregando' : `${results.length} ${results.length === 1 ? 'loja' : 'lojas'}`}</div></div>
      {error && <div className="shops-notice" role="status">Não foi possível atualizar as lojas agora. Tente novamente em instantes.{shops !== null && ' Exibindo a última lista carregada.'}</div>}
      {shops === null && !error && <div className="shops-empty">Procurando lojinhas pelo mundo... ✿</div>}
      {shops !== null && results.length === 0 && <div className="shops-empty"><ShoppingBag size={28}/><strong>{query ? 'Nenhuma loja encontrada' : 'Ainda não há lojas cadastradas'}</strong><span>{query ? 'Tente buscar por outro nome.' : 'Seja a primeira pessoa a cadastrar uma loja no Survival!'}</span></div>}
      <div className="shops-grid">{results.map(shop => <motion.article className="shop-card" key={shop.id} initial={reduced ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={reduced ? undefined : { y: -4 }} transition={{ duration: 0.3 }}><div className="shop-card-top"><div className="shop-avatar"><img src={`https://mc-heads.net/avatar/${encodeURIComponent(shop.jogador)}/128`} alt={`Skin de ${shop.jogador}`} loading="lazy" onError={e => {e.currentTarget.style.display='none';}}/><span aria-hidden="true">✿</span></div><div className="shop-title"><span>LOJA DE {shop.jogador}</span><h3>{shop.nome}</h3></div><ShoppingBag className="shop-icon" size={19} aria-hidden="true" /></div><div className="shop-location"><MapPin size={16} aria-hidden="true"/><div><strong>{shop.mundo === 'world' ? 'Survival' : shop.mundo}</strong><span>X {shop.x} &nbsp; Y {shop.y} &nbsp; Z {shop.z}</span></div></div><div className="shop-command"><span>COMANDO PARA VISITAR</span><div><code>{shop.comando}</code><button onClick={() => copy(shop)} aria-label={`Copiar comando da loja ${shop.nome}`}><span>{copied === shop.id ? 'Copiado' : 'Copiar'}</span>{copied === shop.id ? <Check size={15}/> : <Copy size={15}/>}</button></div>{copied === 'erro:' + shop.id && <small>Não foi possível copiar. Selecione o comando acima.</small>}</div></motion.article>)}</div>
      <div className="shops-tip"><span>✿</span><div><strong>Quer aparecer por aqui?</strong><p>No Survival, vá até o local da sua loja e use <code>/criarloja nome</code>. Cadastre os produtos separadamente com baús e placas. O acesso depende das permissões do terreno.</p><Link to="/ajuda">Saiba mais na central de ajuda ↗</Link></div></div>
    </section><footer className="help-footer"><span>✿ &nbsp; Um mundo feito para florescer.</span><Link to="/ajuda">Central de ajuda ↗</Link></footer></div></main>;
}
