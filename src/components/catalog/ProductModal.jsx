import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { variantesDe, IMG_PLACEHOLDER, NOMBRE_NEGOCIO } from '../../lib/productUtils';
import { useUiStore } from '../../store/useUiStore';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useProductPhotos } from '../../hooks/useProductPhotos';

export default function ProductModal(){
  const p = useUiStore(s => s.productoVisto);
  const cerrar = useUiStore(s => s.cerrarProducto);
  const agregar = useAddToCart();
  const [idx, setIdx] = useState(0);
  const { imagenes: imgs, cargando: cargandoFotos } = useProductPhotos(p);

  useEffect(() => { setIdx(0); }, [p && p.id]);
  useEffect(() => {
    if(!p) return;
    const onKey = e => { if(e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, cerrar]);

  if(!p) return null;
  const variantes = variantesDe(p);

  function compartir(){
    const url = window.location.origin + window.location.pathname + '?producto=' + p.id;
    if(navigator.share){
      navigator.share({ title: p.nombre, text: p.descripcion || `Mirá este producto de ${NOMBRE_NEGOCIO}`, url }).catch(() => {});
    } else if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(() => toast.success('Link copiado al portapapeles'), () => toast.error('No se pudo copiar el link'));
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-label={p.nombre} className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative aspect-video bg-slate-50">
          <img src={imgs[idx] || IMG_PLACEHOLDER} alt={`Fotografía de ${p.nombre}`} decoding="async"
            className={`w-full h-full object-contain ${p.agotado ? 'grayscale opacity-60' : ''}`} />
          {cargandoFotos && <span className="absolute bottom-3 right-3 bg-white/90 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">Cargando fotos…</span>}
          <button onClick={cerrar} aria-label="Cerrar" className="absolute top-3 right-3 bg-white hover:bg-slate-100 rounded-full w-9 h-9 flex items-center justify-center text-slate-700 shadow">✕</button>
          <button onClick={compartir} aria-label="Compartir producto" className="absolute top-3 left-3 bg-white hover:bg-slate-100 rounded-full w-9 h-9 flex items-center justify-center text-slate-700 shadow">🔗</button>
          {imgs.length > 1 && (
            <>
              <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)} aria-label="Foto anterior" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center text-slate-700 shadow">‹</button>
              <button onClick={() => setIdx(i => (i + 1) % imgs.length)} aria-label="Foto siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center text-slate-700 shadow">›</button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" aria-hidden="true">
                {imgs.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === idx ? 'bg-brand-600 w-4' : 'bg-slate-300 w-2'}`}></span>)}
              </div>
            </>
          )}
        </div>

        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-1">{p.nombre}</h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">{p.descripcion || 'Sin descripción disponible.'}</p>
          <div className="space-y-2 mb-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Opciones disponibles</p>
            {variantes.map((v, i) => (
              <div key={i} className="flex justify-between items-center border border-pink-100 rounded-2xl p-3 bg-pink-50/30">
                <span className="text-sm text-slate-800 font-semibold">{v.cantidad} {v.cantidad > 1 ? 'unidades' : 'unidad'} — <b className="text-brand-700">${v.precio}</b></span>
                <button disabled={p.agotado} onClick={() => agregar(p, v)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${p.agotado ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'}`}>
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
