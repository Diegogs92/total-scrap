import PriceEvolution from '../PriceEvolution';
import PriceComparison from '../PriceComparison';

export default function EvolutionSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Evolución de precios</h2>
        <p className="text-white/70">
          Visualiza cambios detectados y el histórico de precios de cada producto.
        </p>
      </div>

      <PriceEvolution />
      <PriceComparison />
    </div>
  );
}
