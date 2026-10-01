import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/useCartStore';

// Agrega al carrito y avisa con un toast (el id evita apilar avisos repetidos).
export function useAddToCart(){
  const agregar = useCartStore(s => s.agregar);
  return useCallback((producto, variante) => {
    if(!variante) return;
    agregar(producto, variante);
    toast.success(`${producto.nombre} agregado al carrito`, { id: 'carrito-' + producto.id });
  }, [agregar]);
}
