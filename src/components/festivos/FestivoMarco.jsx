import { TEMAS } from '../../lib/festivos';
import { useFestivos } from '../../hooks/useFestivos';

// Si la categoría elegida es un día festivo vigente, envuelve la grilla con el marco temático.
export default function FestivoMarco({ categoria, children }){
  const { activos } = useFestivos();
  const a = activos.find(x => x.categoria === categoria);
  if(!a) return children;
  const t = TEMAS[a.tema];
  const fila = Array.from({ length: 16 }, (_, i) => t.decor[i % t.decor.length]);
  return (
    <div className={`rounded-3xl ${t.fondo} ${t.borde} p-3 sm:p-5`}>
      <div aria-hidden="true" className="flex justify-between overflow-hidden text-lg sm:text-2xl select-none mb-2">{fila.map((e, i) => <span key={i}>{e}</span>)}</div>
      <p className={`text-center text-sm font-heading font-semibold mb-3 ${t.titulo}`}>{t.emoji} {t.nombre}</p>
      {children}
      <div aria-hidden="true" className="flex justify-between overflow-hidden text-lg sm:text-2xl select-none mt-3">{fila.map((e, i) => <span key={i}>{e}</span>)}</div>
    </div>
  );
}
