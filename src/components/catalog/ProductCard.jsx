import { memo } from 'react';
import { miniaturaDe, variantesDe, precioDesde, IMG_PLACEHOLDER } from '../../lib/productUtils';
import { useUiStore } from '../../store/useUiStore';
import { useAddToCart } from '../../hooks/useAddToCart';

function ProductCard({ producto: p }){
  const abrirProducto = useUiStore(s => s.abrirProducto);
  const agregar = useAddToCart();
  const foto = miniaturaDe(p);
  const variantes = variantesDe(p);
  const sinStock = !!p.agotado || variantes.length === 0;

  return (
    <article className="group bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cuadrado fijo + object-contain: fotos verticales u horizontales se ven completas, sin recortes */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={foto || IMG_PLACEHOLDER}
          alt={`Fotografía de ${p.nombre}`}
          loading="lazy"
          decoding="async"
          onError={e => { e.currentTarget.src = IMG_PLACEHOLDER; }}
          className={`w-full h-full object-contain group-hover:scale-105 transition duration-500 ${p.agotado ? 'grayscale opacity-60' : ''}`}
        />
        {p.agotado && (
          <span className="absolute top-2 left-2 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Agotado</span>
        )}
        <button onClick={() => abrirProducto(p)} aria-label={`Ver detalle de ${p.nombre}`}
          className="absolute bottom-2 right-2 bg-white text-slate-700 hover:text-brand-700 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition active:scale-90">
          <span aria-hidden="true">🔍</span>
        </button>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">{p.nombre}</h3>
        <div className="mt-3">
          <p className="text-brand-700 font-bold text-base">{precioDesde(p)}</p>
          <button disabled={sinStock} onClick={() => agregar(p, variantes[0])}
            className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              sinStock
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white border border-brand-200 hover:border-transparent active:scale-95'
            }`}>
            <span aria-hidden="true">+</span> Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
