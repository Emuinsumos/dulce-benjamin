import { useEffect, useState } from 'react';
import { imagenesDe } from '../lib/productUtils';
import { obtenerFotos } from '../services/photosService';

// Fotos completas de un producto: las del propio producto (formato viejo) o las de /fotos bajo demanda.
// Mientras cargan devuelve la miniatura, así el modal no queda vacío.
export function useProductPhotos(p){
  const id = p ? p.id : null;
  const enLinea = p ? imagenesDe(p) : [];
  const [fotos, setFotos] = useState(null);

  useEffect(() => {
    setFotos(null);
    if(!id || enLinea.length) return;
    let vivo = true;
    obtenerFotos(id).then(f => { if(vivo) setFotos(f); }).catch(() => { if(vivo) setFotos([]); });
    return () => { vivo = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargando = !!id && !enLinea.length && fotos === null;
  const imagenes = enLinea.length ? enLinea : (fotos && fotos.length ? fotos : (p && p.miniatura ? [p.miniatura] : []));
  return { imagenes, cargando };
}
