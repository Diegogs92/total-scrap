'use client';

import { useState } from 'react';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="btn bg-[#FF715B] hover:bg-[#d65d4b] text-white shadow-md shadow-[#FF715B]/30 hover:shadow-lg rounded-full px-5 py-2 text-sm font-semibold"
        >
          Dejá tu comentario
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="card relative w-full max-w-md bg-[var(--card)] p-6 border border-white/15 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 text-white/70 hover:text-white"
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold text-white mb-2">Déjanos tu comentario</h3>
            <p className="text-sm text-white/70 mb-4">
              Cuéntanos tu opinión o sugerencia. Te responderemos a la brevedad.
            </p>
            <div className="space-y-3">
              <label className="block text-sm text-white/80">
                Correo de contacto
                <input
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none"
                  placeholder="tu@email.com"
                  type="email"
                />
              </label>
              <label className="block text-sm text-white/80">
                Comentario
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none"
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn bg-white/10 text-white hover:bg-white/20"
              >
                Cancelar
              </button>
              <a
                href="mailto:contacto@dgs.solutions?subject=Comentario%20Total%20Scrap"
                className="btn bg-[#1EA896] hover:bg-[#147a6a] text-white shadow-md shadow-[#1EA896]/25"
              >
                Enviar
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
