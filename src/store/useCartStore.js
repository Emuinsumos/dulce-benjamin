import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { variantesDe } from '../lib/productUtils';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      abierto: false,

      agregar: (producto, variante) => set(st => {
        const cartId = producto.id + '-' + variante.cantidad;
        const existe = st.items.find(i => i.cartId === cartId);
        if(existe) return { items: st.items.map(i => i.cartId === cartId ? { ...i, unidades: i.unidades + 1 } : i) };
        return { items: [...st.items, {
          cartId, productoId: producto.id, nombre: producto.nombre,
          cantidadPack: variante.cantidad, precioPack: variante.precio, unidades: 1,
        }] };
      }),
      cambiarUnidades: (cartId, delta) => set(st => ({
        items: st.items.map(i => i.cartId === cartId ? { ...i, unidades: i.unidades + delta } : i).filter(i => i.unidades > 0),
      })),
      quitar: cartId => set(st => ({ items: st.items.filter(i => i.cartId !== cartId) })),
      vaciar: () => set({ items: [] }),

      // El carrito se guarda en el celu: si cambió un precio o se borró un producto, se corrige acá.
      sincronizar: productos => set(st => {
        const next = st.items.flatMap(i => {
          const p = productos[i.productoId];
          const v = p && variantesDe(p).find(v => String(v.cantidad) === String(i.cantidadPack));
          return v ? [{ ...i, nombre: p.nombre, precioPack: v.precio }] : [];
        });
        return JSON.stringify(next) === JSON.stringify(st.items) ? st : { items: next };
      }),

      abrir: () => set({ abierto: true }),
      cerrar: () => set({ abierto: false }),
    }),
    { name: 'dulce-carrito', version: 1, partialize: st => ({ items: st.items }) }
  )
);

// Selectores: cada componente se re-renderiza solo si cambia SU dato.
export const selectTotal = st => st.items.reduce((a, i) => a + i.precioPack * i.unidades, 0);
export const selectCantidad = st => st.items.reduce((a, i) => a + i.unidades, 0);
