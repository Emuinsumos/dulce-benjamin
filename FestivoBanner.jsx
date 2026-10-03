import { TEMAS } from '../../lib/festivos';
import { useFestivos } from '../../hooks/useFestivos';
import ProductCard from '../catalog/ProductCard';

const POS = [
  'top-2 left-3 text-3xl', 'top-3 right-4 text-4xl', 'bottom-3 left-1/3 text-2xl opacity-60', 'bottom-2 right-8 text-3xl',
];

export default function FestivoBanner({ onVerCategoria }){
  const { activos } = useFestivos();
  if(!activos.length) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 w-full pt-6 space-y-4">
      {activos.map(a => {
        const t = TEMAS[a.tema];
        return (
          <section key={a.clave} aria-labelledby={'fest-' + a.clave} className={`relative overflow-hidden rounded-3xl ${t.fondo} ${t.borde} p-5 sm:p-8 shadow-md`}>
            {POS.map((pos, i) => (
              <span key={i} aria-hidden="true" style={{ animationDelay: i * 0.7 + 's' }}
                className={`absolute ${pos} select-none pointer-events-none motion-safe:animate-float`}>{t.decor[i % t.decor.length]}</span>
            ))}
            <div className="relative">
              <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${t.badge}`}>{t.emoji} Edición especial</p>
              <h2 id={'fest-' + a.clave} className={`mt-2 text-2xl sm:text-4xl font-heading font-bold ${t.titulo}`}>{a.categoria}</h2>
              <p className={`mt-1 text-sm sm:text-base ${t.texto}`}>{t.subtitulo}</p>

              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2">
                {a.productos.slice(0, 10).map(p => (
                  <div key={p.id} className="snap-start shrink-0 w-40 sm:w-48"><ProductCard producto={p} /></div>
                ))}
              </div>

              <button onClick={() => onVerCategoria(a.categoria)} className={`mt-3 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition active:scale-95 ${t.boton}`}>
                Ver todo el especial →
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
