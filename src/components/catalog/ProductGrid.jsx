import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

export const GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

export default function ProductGrid({ productos, cargando, error }){
  if(cargando){
    return (
      <div className={GRID} role="status" aria-label="Cargando productos">
        {Array.from({ length: 10 }, (_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }
  if(error){
    return (
      <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-rose-200">
        <span className="text-4xl block mb-2" aria-hidden="true">😕</span>
        <p className="text-slate-700 text-sm">No pudimos cargar los productos. Probá recargar la página.</p>
      </div>
    );
  }
  if(productos.length === 0){
    return (
      <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-pink-200">
        <span className="text-4xl block mb-2" aria-hidden="true">🎈</span>
        <p className="text-slate-700 text-sm">No encontramos productos en esta categoría.</p>
      </div>
    );
  }
  return (
    <div className={GRID}>
      {productos.map(p => <ProductCard key={p.id} producto={p} />)}
    </div>
  );
}
