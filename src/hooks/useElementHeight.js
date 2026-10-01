import { useCallback, useEffect, useRef, useState } from 'react';

// Devuelve [ref, alto]: se actualiza al redimensionar la ventana o cambiar el contenido.
export function useElementHeight(inicial = 0){
  const ref = useRef(null);
  const [alto, setAlto] = useState(inicial);
  const medir = useCallback(() => { if(ref.current) setAlto(ref.current.offsetHeight); }, []);
  useEffect(() => {
    medir();
    window.addEventListener('resize', medir);
    let ro;
    if(typeof ResizeObserver !== 'undefined' && ref.current){ ro = new ResizeObserver(medir); ro.observe(ref.current); }
    return () => { window.removeEventListener('resize', medir); if(ro) ro.disconnect(); };
  }, [medir]);
  return [ref, alto];
}
