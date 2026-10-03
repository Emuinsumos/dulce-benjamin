import { forwardRef } from 'react';
import { NOMBRE_NEGOCIO } from '../../lib/productUtils';
import { useConfig } from '../../hooks/useConfig';
import { useOrders } from '../../hooks/useOrders';
import { useCartStore, selectCantidad } from '../../store/useCartStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useUiStore } from '../../store/useUiStore';

const Header = forwardRef(function Header(_, ref){
  const { config } = useConfig();
  const cantidad = useCartStore(selectCantidad);
  const abrirCarrito = useCartStore(s => s.abrir);
  const loggedIn = useAdminStore(s => s.loggedIn);
  const abrirLogin = useAdminStore(s => s.abrirLogin);
  const abrirAdmin = useAdminStore(s => s.abrirAdmin);
  const abrirPresupuesto = useUiStore(s => s.abrirPresupuestoPublico);
  const { pendientes } = useOrders({ habilitado: loggedIn });

  return (
    <header ref={ref} className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <a href="/" className="flex items-center gap-2" aria-label={`${NOMBRE_NEGOCIO} - inicio`}>
          <span className="text-2xl" aria-hidden="true">🍬</span>
          <span className="text-2xl font-heading font-bold bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">
            {NOMBRE_NEGOCIO}
          </span>
        </a>

        <nav className="flex items-center gap-2 flex-wrap" aria-label="Acciones">
          {config.whatsapp && (
            <a href={'https://wa.me/' + config.whatsapp} target="_blank" rel="noreferrer"
               className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition">
              <i className="fa-brands fa-whatsapp text-sm" aria-hidden="true"></i> WhatsApp
            </a>
          )}
          {config.instagram && (
            <a href={'https://instagram.com/' + config.instagram} target="_blank" rel="noreferrer"
               className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition">
              <i className="fa-brands fa-instagram text-sm" aria-hidden="true"></i> Instagram
            </a>
          )}

          <button onClick={abrirPresupuesto}
            className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold hover:bg-brand-100 transition shadow-sm">
            🧾 Cotizar
          </button>

          <button onClick={abrirCarrito} aria-label={`Abrir carrito (${cantidad} productos)`}
            className="relative p-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition shadow-md shadow-brand-600/20 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cantidad > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {cantidad}
              </span>
            )}
          </button>

          {!loggedIn ? (
            <button onClick={abrirLogin} className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 transition" title="Administración" aria-label="Administración"></button>
          ) : (
            <button onClick={abrirAdmin} className="relative p-2 text-brand-700 bg-brand-50 rounded-full" title="Panel admin" aria-label="Abrir panel de administración">
              ⚙️
              {pendientes > 0 && <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{pendientes}</span>}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
});

export default Header;
