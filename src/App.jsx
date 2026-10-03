import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useProducts } from './hooks/useProducts';
import { useElementHeight } from './hooks/useElementHeight';
import { useUiStore } from './store/useUiStore';
import { useAdminStore } from './store/useAdminStore';
import { norm } from './lib/productUtils';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import Testimonials from './components/home/Testimonials';
import FestivoBanner from './components/festivos/FestivoBanner';
import FestivoMarco from './components/festivos/FestivoMarco';
import { useFestivos } from './hooks/useFestivos';
import SearchBox from './components/catalog/SearchBox';
import CategoryTiles from './components/catalog/CategoryTiles';
import CategoryBar from './components/catalog/CategoryBar';
import ProductGrid from './components/catalog/ProductGrid';
import ProductModal from './components/catalog/ProductModal';

// Todo lo que no es el catálogo se carga aparte (code-splitting): los visitantes no descargan el panel admin ni el PDF.
const CartDrawer = lazy(() => import('./components/cart/CartDrawer'));
const BudgetModal = lazy(() => import('./components/budget/BudgetModal'));
const Chatbot = lazy(() => import('./components/chatbot/Chatbot'));
const LoginModal = lazy(() => import('./components/admin/LoginModal'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

export default function App(){
  const { productos, mapa, infoCategorias, cargando, error } = useProducts();
  const abrirProducto = useUiStore(s => s.abrirProducto);
  const { emojis: emojisFestivos } = useFestivos();
  const loggedIn = useAdminStore(s => s.loggedIn);
  const mostrarLogin = useAdminStore(s => s.mostrarLogin);
  const mostrarAdmin = useAdminStore(s => s.mostrarAdmin);
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [headerRef, headerH] = useElementHeight(64);
  const [pillsRef, pillsH] = useElementHeight(48);

  // Link compartido: ?producto=ID abre el detalle una sola vez.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('producto');
    if(id && mapa[id]){
      abrirProducto({ id, ...mapa[id] });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [mapa, abrirProducto]);

  const q = norm(busqueda.trim());
  const filtrados = useMemo(() => productos
    .filter(p => categoria === 'Todos' || p.categoria === categoria)
    .filter(p => !q || norm(p.nombre).includes(q)), [productos, categoria, q]);
  const sugCategorias = useMemo(() => q.length >= 2 ? infoCategorias.filter(c => norm(c.nombre).includes(q)).slice(0, 5) : [], [infoCategorias, q]);
  const sugProductos = useMemo(() => q.length >= 2 ? productos.filter(p => norm(p.nombre).includes(q)).slice(0, 4) : [], [productos, q]);

  function irACatalogo(){
    setTimeout(() => {
      const el = document.getElementById('catalogo');
      if(el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerH - pillsH - 8, behavior: 'smooth' });
    }, 60);
  }
  function elegirCategoria(nombre){ setCategoria(nombre); setBusqueda(''); irACatalogo(); }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 2200, style: { fontSize: '13px', fontWeight: 600, color: '#1e293b' } }} />
      <Header ref={headerRef} />
      <Hero onVerProductos={irACatalogo} />
      <FestivoBanner onVerCategoria={elegirCategoria} />
      <SearchBox busqueda={busqueda} onChange={setBusqueda} sugCategorias={sugCategorias} sugProductos={sugProductos}
        onElegirCategoria={elegirCategoria} onElegirProducto={p => { abrirProducto(p); setBusqueda(''); }} />
      <CategoryTiles categorias={infoCategorias} onElegir={elegirCategoria} activo={categoria === 'Todos' && !busqueda && !cargando} />

      <div className="flex-1 flex flex-col">
        <CategoryBar ref={pillsRef} top={headerH} emojis={emojisFestivos} categorias={infoCategorias} total={productos.length} activa={categoria}
          onElegir={c => { setCategoria(c); irACatalogo(); }} />
        <main id="catalogo" className="max-w-7xl mx-auto px-4 py-4 flex-1 w-full">
          <FestivoMarco categoria={categoria}>
            <ProductGrid productos={filtrados} cargando={cargando} error={error} />
          </FestivoMarco>
        </main>
      </div>

      <Testimonials />
      <Footer onVerCategoria={elegirCategoria} />
      <ProductModal />
      <Suspense fallback={null}>
        <CartDrawer />
        <BudgetModal />
        <Chatbot />
        {mostrarLogin && <LoginModal />}
        {loggedIn && mostrarAdmin && <AdminPanel />}
      </Suspense>
    </div>
  );
}
