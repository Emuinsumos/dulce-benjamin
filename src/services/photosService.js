import { db } from '../firebase';

// Las fotos completas viven en /fotos/<idProducto>, separadas del catálogo: se bajan solo al abrir un producto.
const cache = new Map();

export function obtenerFotos(id){
  if(!cache.has(id)){
    const p = db.ref('fotos/' + id).once('value').then(snap => {
      const v = (snap.val() || {}).imagenes;
      return Array.isArray(v) ? v : Object.values(v || {});
    });
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return cache.get(id);
}
export function guardarFotos(id, imagenes){
  cache.delete(id);
  return imagenes.length ? db.ref('fotos/' + id).set({ imagenes }) : db.ref('fotos/' + id).remove();
}
export function borrarFotos(id){
  cache.delete(id);
  return db.ref('fotos/' + id).remove();
}
