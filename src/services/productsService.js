import { db } from '../firebase';

// Devuelve el id (nuevo o existente) del producto guardado.
export function guardarProducto(id, data){
  const key = id || db.ref('productos').push().key;
  return db.ref('productos/' + key).set(data).then(() => key);
}
export const eliminarProducto = id => db.ref('productos/' + id).remove();
export const reemplazarProductos = obj => db.ref('productos').set(obj);
export const guardarCategorias = arr => db.ref('categorias').set(arr);
export const guardarConfig = cfg => db.ref('config').set(cfg);
