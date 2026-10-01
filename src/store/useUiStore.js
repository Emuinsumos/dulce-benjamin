import { create } from 'zustand';

// Estado de interfaz compartido (modales). No se guarda en el navegador.
export const useUiStore = create((set) => ({
  productoVisto: null,
  mostrarChat: false,
  mostrarPresupuestoPublico: false,
  abrirProducto: p => set({ productoVisto: p }),
  cerrarProducto: () => set({ productoVisto: null }),
  abrirChat: () => set({ mostrarChat: true }),
  cerrarChat: () => set({ mostrarChat: false }),
  abrirPresupuestoPublico: () => set({ mostrarPresupuestoPublico: true }),
  cerrarPresupuestoPublico: () => set({ mostrarPresupuestoPublico: false }),
}));
