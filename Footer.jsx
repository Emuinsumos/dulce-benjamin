import { useConfig } from '../../hooks/useConfig';
import { useFestivos } from '../../hooks/useFestivos';
import { TEMAS } from '../../lib/festivos';

export default function Footer({ onVerCategoria }){
  const { config } = useConfig();
  const { activos } = useFestivos();
  return (
    <footer className="mt-auto bg-white border-t border-pink-100 py-6 text-center">
      {activos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 px-4 mb-5">
          {activos.map(a => (
            <button key={a.clave} onClick={() => onVerCategoria && onVerCategoria(a.categoria)}
              className="px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-100 transition">
              {TEMAS[a.tema].emoji} Mirá el especial: {a.categoria}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">¡Escribinos directamente!</p>
      <div className="flex justify-center items-center gap-4">
        {config.whatsapp && (
          <a href={'https://wa.me/' + config.whatsapp + '?text=Hola,%20quisiera%20más%20información'} target="_blank" rel="noreferrer"
             className="btn-red btn-whatsapp" aria-label="WhatsApp" title="Enviar mensaje de WhatsApp">
            <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
          </a>
        )}
        {config.instagram && (
          <a href={'https://ig.me/m/' + config.instagram} target="_blank" rel="noreferrer"
             className="btn-red btn-instagram" aria-label="Instagram" title="Enviar mensaje por Instagram">
            <i className="fa-brands fa-instagram" aria-hidden="true"></i>
          </a>
        )}
      </div>
    </footer>
  );
}
