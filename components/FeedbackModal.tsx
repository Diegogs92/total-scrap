'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resultText, setResultText] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        setResultText('¡Comentario enviado con éxito!');
        setMessage('');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setResultText('');
        }, 1500);
      } else {
        setStatus('error');
        setResultText('Error al enviar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error enviando comentario', err);
      setStatus('error');
      setResultText('Error de conexión.');
    }
  };

  const handleClose = () => {
    if (status === 'sending') return;
    onClose();
    setTimeout(() => {
      setMessage('');
      setStatus('idle');
      setResultText('');
    }, 300);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-[#0B0033] rounded-xl border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FF715B]/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-[#FF715B]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Dejanos tu comentario</h3>
              <p className="text-sm text-white/60">
                Tu opinión nos ayuda a mejorar.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={status === 'sending'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tu mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#1EA896] focus:ring-1 focus:ring-[#1EA896]/30 outline-none transition-colors resize-none"
              rows={5}
              placeholder="Escribe tu comentario o sugerencia..."
              required
              disabled={status === 'sending'}
            />
          </div>

          {/* Status message */}
          {resultText && (
            <div
              className={`flex items-center gap-3 text-sm font-medium py-2.5 px-4 rounded-lg transition-all ${
                status === 'error'
                  ? 'text-[#FF715B] bg-[#FF715B]/10 border border-[#FF715B]/20'
                  : status === 'success'
                  ? 'text-[#1EA896] bg-[#1EA896]/10 border border-[#1EA896]/20'
                  : 'text-white/70 bg-white/5 border border-white/15'
              }`}
            >
              {status === 'success' && <CheckCircle className="h-4 w-4" />}
              <span>{resultText}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={status === 'sending'}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!message.trim() || status === 'sending'}
              className="px-5 py-2.5 bg-[#1EA896] hover:bg-[#147a6a] text-white font-semibold rounded-lg shadow-md shadow-[#1EA896]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
