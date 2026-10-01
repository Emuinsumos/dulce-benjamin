import { useEffect, useMemo } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { useCartStore } from '../store/useCartStore';
import { miniaturaDe } from '../lib/productUtils';
import * as svc from '../services/productsService';

export function useProducts(){
  const iniciar = useCatalogStore(s => s.iniciar);
  const mapa = useCatalogStore(s => s.productos);
  const categorias = useCatalogStore(s => s.categorias);
  const cargando = useCatalogStore(s => !(s.listoProductos && s.listoCategorias));
  const error = useCatalogStore(s => s.error);
  const sincronizarCarrito = useCartStore(s => s.sincronizar);

  useEffect(() => { iniciar(); }, [iniciar]);
  useEffect(() => { if(!cargando) sincronizarCarrito(mapa); }, [cargando, mapa, sincronizarCarrito]);

  const productos = useMemo(() => Object.entries(mapa).map(([id, p]) => ({ id, ...p })), [mapa]);

  // Solo categorías con productos; fotos de portada rotativas (prioriza los que no están agotados).
  const infoCategorias = useMemo(() => categorias.map(nombre => {
    const ps = productos.filter(p => p.categoria === nombre);
    const disp = ps.filter(p => !p.agotado);
    const fotos = [...new Set((disp.length ? disp : ps).map(p => miniaturaDe(p)).filter(Boolean))].slice(0, 5);
    return { nombre, cantidad: ps.length, fotos };
  }).filter(c => c.cantidad > 0), [productos, categorias]);

  return {
    productos, mapa, categorias, infoCategorias, cargando, error,
    guardarProducto: svc.guardarProducto,
    eliminarProducto: svc.eliminarProducto,
    guardarCategorias: svc.guardarCategorias,
    reemplazarProductos: svc.reemplazarProductos,
  };
}
