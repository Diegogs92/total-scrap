'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resultText, setResultText] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    setResultText('Enviando...');

    const formData = new FormData();
    formData.append('access_key', '24fd8500-82cb-430e-9baf-e822e4608c65');
    formData.append('name', user?.nombre || 'Usuario Total Scrap');
    formData.append('email', user?.email || 'sin-email@totalscrap.local');
    formData.append('message', message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setResultText('Comentario enviado. Gracias!');
        setMessage('');
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus('idle');
          setResultText('');
        }, 1200);
      } else {
        setStatus('error');
        setResultText('Error al enviar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error enviando comentario', err);
      setStatus('error');
      setResultText('Error de conexion.');
    }
  };

  return (
    <footer
      id="comentarios"
      className="mt-10 border-t border-white/10 bg-[var(--nav-bg)]/80 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-sm text-white/70 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white">Total Scrap</span>
          <span className="text-white/40">|</span>
          <span>Desarrollado por DGS Solutions</span>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn bg-[#FF715B] hover:bg-[#d65d4b] text-white shadow-md shadow-[#FF715B]/30 hover:shadow-lg rounded-full px-5 py-2 text-sm font-semibold"
        >
          Deja tu comentario
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="card relative w-full max-w-md bg-gradient-to-br from-[#0B0033] via-[#370031] to-[#0B0033] p-6 border border-white/20 shadow-2xl rounded-xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 flex items-center justify-center transition-all"
              aria-label="Cerrar"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
            <h3 className="text-2xl font-bold text-white mb-2 pr-8">Dejanos tu comentario</h3>
            <p className="text-sm text-white/60 mb-5">
              Contanos tu opinion o sugerencia. Te responderemos a la brevedad.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-white/80 mb-2 block">Comentario</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#1EA896] focus:ring-2 focus:ring-[#1EA896]/30 outline-none transition-all"
                  rows={5}
                  placeholder="Escribe tu mensaje aqui..."
                  required
                />
              </label>
              {resultText && (
                <div className={`text-sm font-medium text-center py-2 px-3 rounded-lg ${
                  status === 'error'
                    ? 'text-[#FF715B] bg-[#FF715B]/10 border border-[#FF715B]/20'
                    : status === 'success'
                    ? 'text-[#1EA896] bg-[#1EA896]/10 border border-[#1EA896]/20'
                    : 'text-white/70 bg-white/5 border border-white/10'
                }`}>
                  {resultText}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setMessage('');
                    setStatus('idle');
                    setResultText('');
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!message.trim() || status === 'sending'}
                  className="px-5 py-2.5 bg-[#1EA896] hover:bg-[#147a6a] text-white font-semibold rounded-lg shadow-lg shadow-[#1EA896]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
