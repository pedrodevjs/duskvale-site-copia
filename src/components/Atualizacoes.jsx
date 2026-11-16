import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Clock3, Sparkles } from 'lucide-react';
import '../styles/atualizacoes.css';

const timezone = 'America/Sao_Paulo';
const dataFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, day: 'numeric', month: 'long', year: 'numeric' });
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, weekday: 'long' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
const labels = { novo: 'Novidade', ajuste: 'Ajuste', correcao: 'Correção' };

export default function Atualizacoes() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    document.title = 'Atualizações | DuskVale';
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/atualizacoes.json', { signal: controller.signal, cache: 'no-cache' });
        if (!response.ok) throw new Error('Não foi possível carregar');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        setEntries(data.filter((item) => item.id && item.titulo && item.lancadoEm && !Number.isNaN(Date.parse(item.lancadoEm))));
        setStatus('ready');
      } catch (error) {
        if (error.name !== 'AbortError') setStatus((current) => current === 'ready' ? current : 'error');
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, []);

  const groups = useMemo(() => {
    const days = new Map();
    [...entries].sort((a, b) => new Date(b.lancadoEm) - new Date(a.lancadoEm)).forEach((entry) => {
      const key = dayKey.format(new Date(entry.lancadoEm));
      if (!days.has(key)) days.set(key, []);
      days.get(key).push(entry);
    });
    return [...days.entries()];
  }, [entries]);

  return (
    <main className="updates-page">
      <div className="updates-glow" aria-hidden="true" />
      <div className="updates-shell">
        <header className="updates-nav">
          <Link className="updates-brand" to="/" aria-label="DuskVale, página inicial">DUSK<span>VALE</span><i>✿</i></Link>
          <Link className="updates-back" to="/"><ArrowLeft size={15} aria-hidden="true" /> Voltar ao início</Link>
        </header>

        <section className="updates-hero" aria-labelledby="updates-title">
          <div className="updates-eyebrow"><span className="updates-pulse" /> DIÁRIO DO SERVIDOR <span className="updates-eyebrow-star">✦</span></div>
          <h1 id="updates-title">Um mundo sempre<br /><span>florescendo.</span></h1>
          <p>Novidades, melhorias e correções que fazem do DuskVale um lugar ainda mais especial para jogar.</p>
          <div className="updates-hero-meta"><span><Clock3 size={14} aria-hidden="true" /> Horário de Brasília</span><span className="updates-meta-dot">✦</span><span>Feito com carinho para vocês</span></div>
          <div className="updates-hero-flower" aria-hidden="true">✿</div>
        </section>

        <div className="updates-section-heading">
          <div><span className="updates-section-kicker">ACOMPANHE A JORNADA</span><h2>Últimas atualizações <span>✦</span></h2></div>
          <span className="updates-section-count">{entries.length.toString().padStart(2, '0')} registros</span>
        </div>

        <div className="updates-list" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' && <div className="updates-empty">Carregando as novidades...</div>}
          {status === 'error' && <div className="updates-empty">Não foi possível carregar as atualizações agora. Recarregue a página para tentar novamente.</div>}
          {status === 'ready' && groups.length === 0 && <div className="updates-empty">Ainda não há atualizações registradas. Volte em breve para acompanhar as novidades do servidor.</div>}
          {groups.map(([key, items]) => {
            const date = new Date(items[0].lancadoEm);
            return <section className="updates-day" key={key} aria-label={dataFormatter.format(date)}>
              <div className="updates-date"><span className="updates-date-marker" /><h3>{dataFormatter.format(date)}</h3><span className="updates-weekday">{weekdayFormatter.format(date)}</span><span className="updates-date-line" /></div>
              <div className="updates-entries">
                {items.map((item) => <motion.article className="updates-entry" key={item.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -30px 0px" }} transition={{ duration: 0.35 }}>
                  <div className="updates-entry-time"><time dateTime={item.lancadoEm}>{timeFormatter.format(new Date(item.lancadoEm))}</time><span>BRASÍLIA</span></div>
                  <div className="updates-entry-marker" aria-hidden="true"><span /></div>
                  <div className="updates-entry-body"><div className="updates-entry-meta"><span className={`updates-type updates-type-${item.tipo}`}>{labels[item.tipo] || 'Atualização'}</span><span className="updates-project">{item.projeto || 'Servidor'}</span></div><h4>{item.titulo}</h4>{item.descricao && <p>{item.descricao}</p>}</div>
                </motion.article>)}
              </div>
            </section>;
          })}
        </div>
        <footer className="updates-footer"><div><Sparkles size={16} aria-hidden="true" /><span>Um mundo feito para florescer.</span></div><Link to="/">DuskVale <ArrowUpRight size={15} aria-hidden="true" /></Link></footer>
      </div>
    </main>
  );
}
