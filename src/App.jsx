import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Inicio from './components/Inicio.jsx';
import Atualizacoes from './components/Atualizacoes.jsx';
import Ajuda from './components/Ajuda.jsx';
import Beneficios from './components/Beneficios.jsx';
import Lojas from './components/Lojas.jsx';
import Status from './components/Status.jsx';
import Parceiras from './components/Parceiras.jsx';

export default function App() {
  const location = useLocation();
  const reduced = useReducedMotion();
  if (window.location.hostname === 'status.duskvale.com.br') return <Status />;
  return (
    <motion.div key={location.pathname} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
    <Routes location={location}>
      <Route path="/" element={<Inicio />} />
      <Route path="/atualizacoes" element={<Atualizacoes />} />
      <Route path="/status" element={<Status />} />
      <Route path="/parceiras" element={<Parceiras />} />
      <Route path="/ajuda" element={<Ajuda />} />
      <Route path="/lojas" element={<Lojas />} />
      <Route path="/vips" element={<Beneficios />} />
      <Route path="/beneficios" element={<Beneficios />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </motion.div>
  );
}
