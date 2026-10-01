import toast from 'react-hot-toast';

// Reemplazo del confirm() nativo: muestra un aviso con dos botones y devuelve una promesa (true / false).
export function confirmar(mensaje, { si = 'Confirmar', no = 'Cancelar' } = {}){
  return new Promise(resolve => {
    toast.custom(t => (
      <div role="alertdialog" aria-label={mensaje}
        className={`bg-white border border-pink-100 shadow-xl rounded-2xl p-4 max-w-xs w-full ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
        <p className="text-sm text-slate-800 font-medium leading-snug">{mensaje}</p>
        <div className="flex gap-2 mt-3 justify-end">
          <button onClick={() => { toast.dismiss(t.id); resolve(false); }} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">{no}</button>
          <button onClick={() => { toast.dismiss(t.id); resolve(true); }} className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700">{si}</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  });
}
