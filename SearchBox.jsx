import { miniaturaDe, IMG_PLACEHOLDER } from '../../lib/productUtils';

export default function SearchBox({ busqueda, onChange, sugCategorias, sugProductos, onElegirCategoria, onElegirProducto }){
  const hayaSug = sugCategorias.length > 0 || sugProductos.length > 0;
  return (
    <section className="max-w-lg mx-auto px-4 pt-6 pb-2 w-full" aria-label="Buscador">
      <div className="relative">
        <label htmlFor="buscador" className="sr-only">Buscar productos</label>
        <input id="buscador" type="search" value={busqueda} onChange={e => onChange(e.target.value)}
          placeholder="Buscar cajitas, temáticas, combos..."
          className="w-full bg-white border border-pink-200 rounded-full py-3 px-5 pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm text-slate-800 placeholder:text-slate-500 transition" />
        <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>

      {hayaSug && (
        <div className="mt-2 bg-white border border-pink-100 rounded-2xl shadow-lg p-3 space-y-2">
          {sugCategorias.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Categorías</p>
              <div className="flex flex-wrap gap-1.5">
                {sugCategorias.map(c => (
                  <button key={c.nombre} onClick={() => onElegirCategoria(c.nombre)} className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100">
                    {c.nombre} <span className="opacity-70">({c.cantidad})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {sugProductos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Productos</p>
              {sugProductos.map(p => (
                <button key={p.id} onClick={() => onElegirProducto(p)} className="w-full flex items-center gap-2.5 py-1.5 text-left hover:bg-pink-50/60 rounded-lg">
                  <img src={miniaturaDe(p) || IMG_PLACEHOLDER} alt="" loading="lazy" onError={e => { e.currentTarget.src = IMG_PLACEHOLDER; }} className="w-9 h-9 rounded-lg object-contain bg-slate-50" />
                  <span className="text-xs text-slate-800 font-medium truncate">{p.nombre}</span>
                  <span className="text-[10px] text-slate-600 ml-auto whitespace-nowrap">{p.categoria}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
