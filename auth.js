// ⚠️ TEMPORAL: es el mismo chequeo que tenía App.jsx. Cualquiera puede leerlo en el bundle.
// Fase siguiente: reemplazar SOLO esta función por Firebase Auth (email + contraseña).
export function verificarAdmin(usuario, contrasena){
  return usuario === 'Micaela' && contrasena === 'pablo';
}
