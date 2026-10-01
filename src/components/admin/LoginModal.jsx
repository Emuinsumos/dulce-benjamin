import React, { useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';

export default function LoginModal(){
  const { loggedIn, mostrarLogin, mostrarAdmin, adminTab, errorLogin, abrirLogin, cerrarLogin, abrirAdmin, cerrarAdmin, setTab, login, logout } = useAdminStore();
  const setMostrarLogin = v => (v ? abrirLogin() : cerrarLogin());
  function intentarLogin(){ if(login(usuario, contrasena)){ setUsuario(''); setContrasena(''); } }
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  return (
    <>
      {mostrarLogin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setMostrarLogin(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h2 className="text-lg font-heading font-bold mb-4 text-slate-800">Acceso Admin</h2>
            <input value={usuario} onChange={e=>setUsuario(e.target.value)} placeholder="Usuario" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs mb-2"/>
            <input value={contrasena} onChange={e=>setContrasena(e.target.value)} type="password" placeholder="Contraseña" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs mb-3"/>
            {errorLogin && <p className="text-rose-500 text-xs mb-3">{errorLogin}</p>}
            <button onClick={intentarLogin} className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-600 transition">Ingresar</button>
          </div>
        </div>
      )}
    </>
  );
}
