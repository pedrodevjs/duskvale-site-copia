import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Search, X, MessageCircle, BookOpen, ChevronDown, Sparkles } from 'lucide-react';
import { categories, topics } from '../data/ajuda.js';
import '../styles/ajuda.css';

const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Ajuda() {
  const reduced = useReducedMotion();
  const [category, setCategory] = useState('todos');
  const [query, setQuery] = useState('');
  const [openTopic, setOpenTopic] = useState(null);
  useEffect(() => { document.title = 'Central de ajuda | DuskVale'; }, []);
  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return topics.filter((topic) => {
      const matchesCategory = category === 'todos' || topic.category === category;
      const text = [topic.title, topic.summary, ...(topic.paragraphs || []), ...(topic.commands || []).flat(), ...(topic.examples || []).flatMap((example) => [example.title, example.content, example.description]), categories.find((item) => item.id === topic.category)?.label || ''].join(' ');
      return matchesCategory && (!term || normalize(text).includes(term));
    });
  }, [category, query]);
  const selected = categories.find((item) => item.id === category);

  function selectCategory(id) { setCategory(id); setOpenTopic(null); }
  return <main className="help-page">
    <div className="help-glow" aria-hidden="true" />
    <div className="help-shell">
      <header className="help-nav"><Link className="help-brand" to="/" aria-label="DuskVale, página inicial">DUSK<span>VALE</span><i>✿</i></Link><div className="help-nav-links"><Link to="/beneficios">Benefícios VIP</Link><Link to="/atualizacoes">Atualizações</Link><Link className="help-back" to="/"><ArrowLeft size={15} aria-hidden="true" /> Início</Link></div></header>
      <section className="help-hero" aria-labelledby="help-title">
        <div className="help-kicker"><span /> UM CANTINHO PARA VOCÊ <span className="help-sparkle">✦</span></div>
        <h1 id="help-title">Como podemos <span>ajudar?</span></h1>
        <p>Seu guia para descobrir, construir e viver boas histórias no DuskVale. Encontre respostas para suas dúvidas por aqui. 🌸</p>
        <label className="help-search"><Search size={20} aria-hidden="true" /><span className="sr-only">Buscar na central de ajuda</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por terrenos, comandos, lojas..." />{query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><X size={18} /></button>}</label>
        <div className="help-search-hint">ASSUNTOS POPULARES <button onClick={() => { setQuery('terreno'); selectCategory('todos'); }}>Terrenos</button><button onClick={() => { setQuery('pétalas'); selectCategory('todos'); }}>Pétalas</button><button onClick={() => { setQuery('tesouro'); selectCategory('todos'); }}>Tesouro</button></div>
        <div className="help-hero-flower" aria-hidden="true">✿</div>
      </section>
      <section className="help-content" aria-label="Tópicos de ajuda">
        <aside className="help-sidebar"><div className="help-sidebar-label">EXPLORE POR ASSUNTO</div><button className={category === 'todos' ? 'active' : ''} onClick={() => selectCategory('todos')}><span className="help-side-icon">✦</span> Todos os tópicos <span className="help-side-count">{topics.length}</span></button>{categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => selectCategory(item.id)}><span className="help-side-icon">{item.icon}</span>{item.label}<span className="help-side-count">{topics.filter((topic) => topic.category === item.id).length}</span></button>)}<div className="help-sidebar-note"><Sparkles size={16} aria-hidden="true" /><p>Uma comunidade mais bonita quando todo mundo se ajuda.</p></div></aside>
        <div className="help-main">
          <div className="help-section-label"><span>{selected ? selected.label.toUpperCase() : 'CENTRAL DE CONHECIMENTO'}</span><span>{filtered.length} {filtered.length === 1 ? 'tópico' : 'tópicos'}</span></div>
          <div className="help-heading"><div><h2>{query ? 'Resultados da busca' : selected ? selected.label : 'Explore as dúvidas'}</h2><p>{query ? `Resultados para “${query}”` : selected?.description || 'Tudo o que você precisa saber para aproveitar o servidor.'}</p></div><BookOpen size={23} aria-hidden="true" /></div>
          <div className="help-topics" aria-live="polite">
            {filtered.length === 0 && <div className="help-empty"><Search size={23} /><strong>Nenhuma resposta encontrada</strong><p>Tente outra palavra ou escolha outro assunto.</p><button onClick={() => {setQuery(''); selectCategory('todos');}}>Ver todos os tópicos</button></div>}
            {filtered.map((topic) => { const expanded = openTopic === topic.id; const cat = categories.find((item) => item.id === topic.category); return <motion.article className={`help-topic${expanded ? ' expanded' : ''}`} key={topic.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <button className="help-topic-trigger" type="button" aria-expanded={expanded} aria-controls={`topic-${topic.id}`} onClick={() => setOpenTopic(expanded ? null : topic.id)}><span className="help-topic-icon" aria-hidden="true">{cat?.icon}</span><span className="help-topic-copy"><span className="help-topic-category">{cat?.label}</span><strong>{topic.title}</strong><span className="help-topic-summary">{topic.summary}</span></span><ChevronDown className="help-chevron" size={18} aria-hidden="true" /></button>
              <div id={`topic-${topic.id}`} className="help-topic-detail" hidden={!expanded}>{topic.paragraphs?.map((text, index) => <p key={index}>{text}</p>)}{topic.examples?.map((example) => <div className="help-example" key={example.title}><span>{example.title}</span><pre>{example.content}</pre>{example.description && <p>{example.description}</p>}</div>)}{topic.commands && <div className="help-commands"><span>COMANDOS ÚTEIS</span>{topic.commands.map(([command, description]) => <div key={command}><code>{command}</code><p>{description}</p></div>)}</div>}{topic.link && (topic.link.href.startsWith('/') ? <Link className="help-topic-link" to={topic.link.href}>{topic.link.label}<ArrowRight size={15} /></Link> : <a className="help-topic-link" href={topic.link.href}>{topic.link.label}<ArrowRight size={15} /></a>)}</div>
            </motion.article>; })}
          </div>
        </div>
      </section>
      <section className="help-support"><div className="help-support-icon"><MessageCircle size={24} /></div><div><span>AINDA PRECISA DE AJUDA?</span><h2>Estamos aqui por você.</h2><p>Converse com nossa equipe e com a comunidade no Discord.</p></div><a href="https://discord.gg/J8ay8fNtux">Ir para o Discord <ArrowRight size={16} /></a></section>
      <footer className="help-footer"><span>✿ &nbsp; Um mundo feito para florescer.</span><Link to="/atualizacoes">Diário de atualizações ↗</Link></footer>
    </div>
  </main>;
}
