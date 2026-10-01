import { create } from 'zustand';
import { db } from '../firebase';
import { SALUDO_BOT_DEFECTO } from '../lib/chatbotDefaults';

let iniciado = false;

// Datos públicos del catálogo. Se escucha Firebase UNA sola vez, sin importar cuántos componentes lo usen.
export const useCatalogStore = create((set) => ({
  productos: {},
  categorias: [],
  config: { whatsapp: '', instagram: '', logo: '' },
  listoProductos: false,
  listoCategorias: false,
  chatbotSaludo: SALUDO_BOT_DEFECTO,
  chatbotPreguntas: {},
  listoConfig: false,
  listoChatbot: false,
  error: null,

  iniciar: () => {
    if(iniciado) return;
    iniciado = true;
    const fallo = err => set({ error: err.message, listoProductos: true, listoCategorias: true, listoConfig: true, listoChatbot: true });
    db.ref('productos').on('value', s => set({ productos: s.val() || {}, listoProductos: true }), fallo);
    db.ref('categorias').on('value', s => set({ categorias: s.val() || [], listoCategorias: true }), fallo);
    db.ref('config').on('value', s => set({ config: s.val() || { whatsapp: '', instagram: '', logo: '' }, listoConfig: true }), fallo);
    db.ref('chatbot').on('value', snap => {
      const v = snap.val() || {};
      set({ chatbotSaludo: v.saludo || SALUDO_BOT_DEFECTO, chatbotPreguntas: v.preguntas || {}, listoChatbot: true });
    }, fallo);
  },
}));
