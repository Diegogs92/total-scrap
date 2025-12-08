'use client';

import { X, TrendingDown, ExternalLink, Package, DollarSign, BarChart3 } from 'lucide-react';
import { ScrapeResult } from '@/types';

type Props = {
  products: ScrapeResult[];
  onClose: () => void;
};

export default function ComparisonModal({ products, onClose }: Props) {
  if (products.length === 0) return null;

  // Agrupar por nombre
  const groupedByName = products.reduce((acc, product) => {
    const key = product.nombre.toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, ScrapeResult[]>);

  const groups = Object.entries(groupedByName).map(([_, items]) => {
    const precios = items.map(item => item.precio);
    const minPrecio = Math.min(...precios);
    const maxPrecio = Math.max(...precios);
    const diferencia = maxPrecio - minPrecio;
    const diferenciaPorcentaje = maxPrecio > 0 ? ((diferencia / maxPrecio) * 100) : 0;

    return {
      nombre: items[0].nombre,
      items: items.sort((a, b) => a.precio - b.precio),
      minPrecio,
      maxPrecio,
      diferencia,
      diferenciaPorcentaje,
      proveedorCount: new Set(items.map(i => i.proveedor)).size,
    };
  });

  // Calcular estadísticas globales
  const totalProducts = products.length;
  const uniqueProducts = groups.length;
  const avgPrice = products.reduce((sum, p) => sum + p.precio, 0) / products.length;
  const totalSavings = groups.reduce((sum, g) => sum + g.diferencia, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-7xl my-8">
        <div className="card p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Comparación de Productos</h2>
              <p className="text-white/60 text-sm mt-1">
                {totalProducts} productos seleccionados • {uniqueProducts} productos únicos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Productos</p>
                  <p className="text-2xl font-bold text-white">{uniqueProducts}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-sky-500/10 to-sky-600/5 border-sky-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Proveedores</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(products.map(p => p.proveedor)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Precio Promedio</p>
                  <p className="text-2xl font-bold text-white">
                    ${avgPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Ahorro Total</p>
                  <p className="text-2xl font-bold text-white">
                    ${totalSavings.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparisons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Comparación Detallada</h3>

            {groups.map((group, idx) => (
              <div key={idx} className="card p-4 bg-black/20">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-white font-medium">{group.nombre}</h4>
                    <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                      <span>{group.proveedorCount} proveedores</span>
                      {group.proveedorCount > 1 && (
                        <>
                          <span className="text-white/40">•</span>
                          <span>
                            ${group.minPrecio.toLocaleString('es-AR')} - $
                            {group.maxPrecio.toLocaleString('es-AR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {group.proveedorCount > 1 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <TrendingDown className="h-4 w-4" />
                        {group.diferenciaPorcentaje.toFixed(1)}%
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        ${group.diferencia.toLocaleString('es-AR')} de ahorro
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        itemIdx === 0 && group.proveedorCount > 1
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{item.proveedor}</span>
                          {itemIdx === 0 && group.proveedorCount > 1 && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-500/30 text-emerald-100 rounded-full">
                              Mejor precio
                            </span>
                          )}
                        </div>
                        {item.descuento && (
                          <span className="text-xs text-emerald-300 mt-1 inline-block">
                            {item.descuento}
                          </span>
                        )}
                        <div className="text-xs text-white/40 mt-1">
                          {new Date(item.fechaScraping).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            ${item.precio.toLocaleString('es-AR')}
                          </div>
                          {itemIdx > 0 && group.proveedorCount > 1 && (
                            <div className="text-xs text-rose-400">
                              +${(item.precio - group.minPrecio).toLocaleString('es-AR')}
                            </div>
                          )}
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Ver producto"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="btn bg-white/10 hover:bg-white/20 text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
