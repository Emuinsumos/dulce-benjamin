import { forwardRef } from 'react';

const CategoryBar = forwardRef(function CategoryBar({ categorias, total, activa, onElegir, top, emojis = {} }, ref){
  const items = [{ nombre: 'Todos', cantidad: total }, ...categorias];
  return (
    <nav ref={ref} aria-label="Categorías" className="sticky z-20 w-full bg-white/95 backdrop-blur-md border-b border-pink-100 mb-2" style={{ top }}>
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5 pr-8">
          {items.map(c => (
            <button key={c.nombre} onClick={() => onElegir(c.nombre)} aria-pressed={activa === c.nombre}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-200 ${
                activa === c.nombre
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/60'
              }`}>
              {emojis[c.nombre] ? emojis[c.nombre] + ' ' : ''}{c.nombre} <span className="opacity-70 font-medium">{c.cantidad}</span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </nav>
  );
});

export default CategoryBar;
