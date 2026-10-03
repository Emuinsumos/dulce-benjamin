import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfig } from '../../hooks/useConfig';
import { useCartStore } from '../../store/useCartStore';
import { crearPedido, urlWhatsApp } from '../../services/ordersService';

export default function CartDrawer(){
  const { config } = useConfig();
  const carrito = useCartStore(s => s.items);
  const mostrarCarrito = useCartStore(s => s.abierto);
  const cambiarUnidades = useCartStore(s => s.cambiarUnidades);
  const quitarDelCarrito = useCartStore(s => s.quitar);
  const vaciar = useCartStore(s => s.vaciar);
  const abrirCarrito = useCartStore(s => s.abrir);
  const cerrarCarrito = useCartStore(s => s.cerrar);
  const setMostrarCarrito = v => (v ? abrirCarrito() : cerrarCarrito());
  const [datosPedido, setDatosPedido] = useState({nombre:'', telefono:'', zona:'', fecha:''});
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const total = carrito.reduce((acc,i)=>acc+i.precioPack*i.unidades,0);
  function enviarPedido(){
    if(!datosPedido.nombre || !datosPedido.telefono || !datosPedido.zona || !datosPedido.fecha) return;
    if(carrito.length===0) return;
    crearPedido({ items: carrito, total, datos: datosPedido }).catch(() => toast.error('No se pudo registrar el pedido. Probá de nuevo.'));
    if(config.whatsapp) window.open(urlWhatsApp(config.whatsapp, carrito, total, datosPedido), '_blank');
    setPedidoEnviado(true);
    vaciar();
    setDatosPedido({nombre:'', telefono:'', zona:'', fecha:''});
    setTimeout(()=>{ setPedidoEnviado(false); setMostrarCarrito(false); }, 2500);
  }

  return (
    <>
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm justify-end z-50 flex" onClick={()=>setMostrarCarrito(false)}>
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-pink-100">
              <h2 className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">🛒 Tu pedido</h2>
              <button onClick={()=>setMostrarCarrito(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {pedidoEnviado ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="text-5xl mb-4">🎉</span>
                <h3 className="text-xl font-bold text-emerald-600 mb-2">¡Pedido enviado!</h3>
                <p className="text-sm text-slate-500">Te vamos a contactar a la brevedad para confirmar los detalles.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {carrito.length===0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <span className="text-4xl block mb-2">🛍️</span>
                      <p className="text-sm">Tu carrito está vacío</p>
                    </div>
                  ) : carrito.map(i=>(
                    <div key={i.cartId} className="flex justify-between items-center border border-pink-100 rounded-2xl p-3 bg-pink-50/20">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{i.nombre}</p>
                        <p className="text-xs text-slate-400">Pack de {i.cantidadPack} · ${i.precioPack} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-pink-200 rounded-lg bg-white">
                          <button onClick={()=>cambiarUnidades(i.cartId,-1)} className="w-7 h-7 flex items-center justify-center text-slate-500 font-bold hover:bg-pink-50">-</button>
                          <span className="px-2 text-xs font-bold text-slate-700">{i.unidades}</span>
                          <button onClick={()=>cambiarUnidades(i.cartId,1)} className="w-7 h-7 flex items-center justify-center text-slate-500 font-bold hover:bg-pink-50">+</button>
                        </div>
                        <button onClick={()=>quitarDelCarrito(i.cartId)} className="text-slate-300 hover:text-rose-500 ml-1">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>

                {carrito.length>0 && (
                  <div className="border-t border-pink-100 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-slate-700">Total:</span>
                      <span className="text-brand-600 font-heading text-2xl">${total}</span>
                    </div>

                    <div className="space-y-2 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Datos de entrega</h3>
                      <input value={datosPedido.nombre} onChange={e=>setDatosPedido({...datosPedido, nombre:e.target.value})} placeholder="Tu nombre completo" className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"/>
                      <input value={datosPedido.telefono} onChange={e=>setDatosPedido({...datosPedido, telefono:e.target.value})} placeholder="Teléfono de contacto" className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"/>
                      <input value={datosPedido.zona} onChange={e=>setDatosPedido({...datosPedido, zona:e.target.value})} placeholder="Localidad / Zona" className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"/>
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Fecha del evento</label>
                        <input value={datosPedido.fecha} onChange={e=>setDatosPedido({...datosPedido, fecha:e.target.value})} type="date" className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30"/>
                      </div>
                    </div>

                    <button onClick={enviarPedido} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2">
                      <i className="fa-brands fa-whatsapp text-lg"></i> Confirmar por WhatsApp
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
