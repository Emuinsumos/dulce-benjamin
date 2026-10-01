import { useEffect } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { guardarConfig } from '../services/productsService';

export function useConfig(){
  const iniciar = useCatalogStore(s => s.iniciar);
  const config = useCatalogStore(s => s.config);
  useEffect(() => { iniciar(); }, [iniciar]);
  return { config, guardarConfig };
}
