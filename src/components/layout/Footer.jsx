import { useConfig } from '../../hooks/useConfig';

export default function Footer(){
  const { config } = useConfig();
  return (
    <footer className="mt-auto bg-white border-t border-pink-100 py-6 text-center">
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
