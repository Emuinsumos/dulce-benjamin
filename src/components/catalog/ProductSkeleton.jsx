// Mismo tamaño que ProductCard para que la grilla no salte cuando llegan los datos.
export default function ProductSkeleton(){
  return (
    <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-slate-100"></div>
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-4/5"></div>
        <div className="h-3.5 bg-slate-100 rounded w-2/5"></div>
        <div className="h-8 bg-slate-100 rounded-xl mt-3"></div>
      </div>
    </div>
  );
}
