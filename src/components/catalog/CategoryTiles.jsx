import { useEffect, useState } from 'react';
import { IMG_PLACEHOLDER } from '../../lib/productUtils';

export default function CategoryTiles({ categorias, onElegir, activo }){
  const [verTodas, setVerTodas] = useState(false);
  const [tick, setTick] = useState(0);

  // Rota la foto de cada categoría cada 5 s (solo mientras los tiles están visibles).
  useEffect(() => {
    if(!activo) return;
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, [activo]);

  if(!activo || categorias.length === 0) return null;
  const visibles = verTodas ? categorias : categorias.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 w-full pt-4 pb-4" aria-labelledby="cat-titulo">
      <h2 id="cat-titulo" className="font-heading font-semibold text-xl text-slate-900 mb-3">Comprá por categoría</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibles.map((c, i) => {
          const n = c.fotos.length;
          const foto = n ? c.fotos[(tick + i) % n] : IMG_PLACEHOLDER;
          const anterior = tick > 0 && n > 1 ? c.fotos[(tick + i - 1) % n] : null;
          return (
            <button key={c.nombre} onClick={() => onElegir(c.nombre)} aria-label={`${c.nombre}, ${c.cantidad} productos`}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-pink-100 text-left shadow-sm">
              {anterior && <img src={anterior} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <img key={tick + '-' + i} src={foto} alt="" loading="lazy" onError={e => { e.currentTarget.src = IMG_PLACEHOLDER; }}
                className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-heading font-semibold text-sm leading-tight line-clamp-2">{c.nombre}</p>
                <p className="text-white/90 text-[11px] mt-0.5">{c.cantidad} {c.cantidad === 1 ? 'producto' : 'productos'}</p>
              </div>
            </button>
          );
        })}
      </div>
      {categorias.length > 8 && (
        <button onClick={() => setVerTodas(v => !v)} className="mt-3 mx-auto block px-5 py-2 rounded-full border border-pink-200 bg-white text-xs font-semibold text-slate-700 hover:bg-pink-50">
          {verTodas ? 'Ver menos' : `Ver todas las categorías (${categorias.length})`}
        </button>
      )}
    </section>
  );
}
