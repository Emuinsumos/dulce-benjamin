import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useConfig } from '../../hooks/useConfig';
import { useCartStore } from '../../store/useCartStore';
import { useUiStore } from '../../store/useUiStore';
import { variantesDe } from '../../lib/productUtils';

export default function BudgetModal(){
  // --- Estado global (fase 2): carrito, sesión admin, UI y datos vienen de stores/hooks ---
  const { productos: listaProductos, mapa: productos, categorias } = useProducts();
  const { config } = useConfig();
  const carrito = useCartStore(s => s.items);
  const { mostrarChat, mostrarPresupuestoPublico, abrirChat, cerrarChat, abrirPresupuestoPublico, cerrarPresupuestoPublico } = useUiStore();
  const setMostrarPresupuestoPublico = v => (v ? abrirPresupuestoPublico() : cerrarPresupuestoPublico());
  const [pubProductoId, setPubProductoId] = useState('');
  const [pubVarianteIdx, setPubVarianteIdx] = useState(0);
  const [pubCantidad, setPubCantidad] = useState('1');
  const [pubItems, setPubItems] = useState([]);
  function agregarItemPublico(){
    if(!pubProductoId) return;
    const p = productos[pubProductoId];
    const variante = variantesDe(p)[pubVarianteIdx];
    const cant = Number(pubCantidad) || 1;
    setPubItems(prev => [...prev, {nombre: `${p.nombre} (pack ${variante.cantidad})`, cantidad: cant, precio: variante.precio}]);
    setPubCantidad('1');
  }
  function quitarItemPublico(idx){
    setPubItems(prev => prev.filter((_,i)=>i!==idx));
  }
  const pubTotal = pubItems.reduce((a,it)=>a+it.cantidad*it.precio,0);
  function enviarPresupuestoPublicoWhatsapp(){
    const lineas = ['✨ *Presupuesto personalizado web* ✨\n'];
    pubItems.forEach(it => lineas.push(`• ${it.cantidad}x ${it.nombre} = $${it.cantidad*it.precio}`));
    lineas.push(`\n💰 *Total estimado:* $${pubTotal}`);
    lineas.push('_Precios sujetos a confirmación y disponibilidad de envío._');
    const mensaje = encodeURIComponent(lineas.join('\n'));
    window.open(`https://wa.me/${config.whatsapp}?text=${mensaje}`, '_blank');
  }

  return (
    <>
      {mostrarPresupuestoPublico && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50" onClick={()=>setMostrarPresupuestoPublico(false)}>
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-pink-100">
              <h2 className="text-xl font-heading font-bold text-slate-800">🎀 Armá tu presupuesto</h2>
              <button onClick={()=>setMostrarPresupuestoPublico(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="py-4 space-y-3">
              <select value={pubProductoId} onChange={e=>{setPubProductoId(e.target.value); setPubVarianteIdx(0);}} className="w-full border border-pink-200 rounded-xl p-2.5 text-xs bg-white">
                <option value="">Elegir producto del catálogo</option>
                {listaProductos.filter(p=>!p.agotado).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              
              {pubProductoId && (
                <select value={pubVarianteIdx} onChange={e=>setPubVarianteIdx(Number(e.target.value))} className="w-full border border-pink-200 rounded-xl p-2.5 text-xs bg-white">
                  {variantesDe(productos[pubProductoId]).map((v,idx)=>(
                    <option key={idx} value={idx}>{v.cantidad} unidad(es) — ${v.precio}</option>
                  ))}
                </select>
              )}
              
              <div className="flex gap-2">
                <input value={pubCantidad} onChange={e=>setPubCantidad(e.target.value)} type="number" min="1" placeholder="Cant. packs" className="border border-pink-200 rounded-xl p-2.5 text-xs w-28"/>
                <button onClick={agregarItemPublico} className="flex-1 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition">Agregar al borrador</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-b border-pink-100 py-3 space-y-2">
              {pubItems.length===0 && <p className="text-slate-400 text-xs text-center py-6">Seleccioná ítems para calcular el presupuesto estimado.</p>}
              {pubItems.map((it,idx)=>(
                <div key={idx} className="flex justify-between items-center text-xs bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                  <span>{it.cantidad}x {it.nombre} — <b>${it.cantidad*it.precio}</b></span>
                  <button onClick={()=>quitarItemPublico(idx)} className="text-slate-300 hover:text-rose-500">🗑</button>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">Total Estimado:</span>
                <span className="text-brand-600 font-heading text-xl font-bold">${pubTotal}</span>
              </div>

              {pubItems.length>0 && config.whatsapp && (
                <button onClick={enviarPresupuestoPublicoWhatsapp}
                  className="w-full bg-emerald-500 text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                  <i className="fa-brands fa-whatsapp text-base"></i> Consultar este presupuesto por WhatsApp
                </button>
              )}

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                * Los precios son de carácter orientativo y están sujetos a confirmación.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
