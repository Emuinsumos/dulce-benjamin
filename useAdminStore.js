import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { verificarAdmin } from '../lib/auth';

export const useAdminStore = create(
  persist(
    (set) => ({
      loggedIn: false,
      mostrarLogin: false,
      mostrarAdmin: false,
      adminTab: 'tablero',
      errorLogin: '',

      abrirLogin: () => set({ mostrarLogin: true, errorLogin: '' }),
      cerrarLogin: () => set({ mostrarLogin: false, errorLogin: '' }),
      login: (usuario, contrasena) => {
        const ok = verificarAdmin(usuario, contrasena);
        set(ok ? { loggedIn: true, mostrarLogin: false, errorLogin: '' }
               : { errorLogin: 'Usuario o contraseña incorrectos' });
        return ok;
      },
      logout: () => set({ loggedIn: false, mostrarAdmin: false }),
      abrirAdmin: () => set({ mostrarAdmin: true }),
      cerrarAdmin: () => set({ mostrarAdmin: false }),
      setTab: adminTab => set({ adminTab }),
    }),
    // La sesión sobrevive al refresh pero no al cerrar la pestaña.
    { name: 'dulce-admin', storage: createJSONStorage(() => sessionStorage), partialize: st => ({ loggedIn: st.loggedIn }) }
  )
);
