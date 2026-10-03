import { useEffect, useMemo } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { slugCategoria, vigente, TEMAS } from '../lib/festivos';

// Categorías marcadas como "día festivo" que están vigentes y tienen productos disponibles.
export function useFestivos(){
  const iniciar = useCatalogStore(s => s.iniciar);
  const festivos = useCatalogStore(s => s.festivos);
  const mapa = useCatalogStore(s => s.productos);
  const categorias = useCatalogStore(s => s.categorias);
  useEffect(() => { iniciar(); }, [iniciar]);

  const activos = useMemo(() => categorias.flatMap(categoria => {
    const f = festivos[slugCategoria(categoria)];
    if(!f || !vigente(f)) return [];
    const productos = Object.entries(mapa).map(([id, p]) => ({ id, ...p })).filter(p => p.categoria === categoria && !p.agotado);
    if(!productos.length) return [];
    return [{ clave: slugCategoria(categoria), categoria, tema: TEMAS[f.tema] ? f.tema : 'generico', productos }];
  }), [festivos, mapa, categorias]);

  const emojis = useMemo(() => Object.fromEntries(activos.map(a => [a.categoria, TEMAS[a.tema].emoji])), [activos]);
  return { activos, emojis };
}
