// Estilos (marcos) para categorías que son un día festivo. Las clases están completas para que Tailwind las detecte.
export const TEMAS = {
  generico:    { nombre: 'Fecha especial',  emoji: '🎉', decor: ['🎉', '✨', '🎈', '🎊'],
    fondo: 'bg-gradient-to-br from-pink-100 via-fuchsia-100 to-amber-100', borde: 'border-2 border-pink-300',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-brand-700', boton: 'bg-brand-600 text-white hover:bg-brand-700',
    subtitulo: 'Productos especiales por tiempo limitado' },
  halloween:   { nombre: 'Halloween',       emoji: '🎃', decor: ['🦇', '🎃', '🕷️', '👻', '🦇'],
    fondo: 'bg-gradient-to-br from-slate-900 via-purple-950 to-orange-900', borde: 'border-2 border-orange-500',
    titulo: 'text-white', texto: 'text-orange-100', badge: 'bg-orange-500 text-slate-900', boton: 'bg-orange-500 text-slate-900 hover:bg-orange-400',
    subtitulo: 'Dulces y cajitas que dan un susto delicioso' },
  pascua:      { nombre: 'Pascua',          emoji: '🐣', decor: ['🥚', '🐰', '🐣', '🌷', '🥚'],
    fondo: 'bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100', borde: 'border-2 border-yellow-300',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-pink-700', boton: 'bg-pink-600 text-white hover:bg-pink-700',
    subtitulo: 'Huevos, conejitos y sorpresas para toda la familia' },
  navidad:     { nombre: 'Navidad',         emoji: '🎄', decor: ['🎄', '⭐', '🎁', '❄️', '🔔'],
    fondo: 'bg-gradient-to-br from-red-700 via-red-800 to-green-900', borde: 'border-2 border-green-300',
    titulo: 'text-white', texto: 'text-red-50', badge: 'bg-white text-red-700', boton: 'bg-white text-red-700 hover:bg-red-50',
    subtitulo: 'Regalos dulces para compartir en Navidad' },
  madre:       { nombre: 'Día de la Madre', emoji: '💐', decor: ['🌸', '💐', '💗', '🌷', '🌸'],
    fondo: 'bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100', borde: 'border-2 border-rose-300',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-rose-700', boton: 'bg-rose-600 text-white hover:bg-rose-700',
    subtitulo: 'Para mimar a mamá con algo dulce' },
  padre:       { nombre: 'Día del Padre',   emoji: '👔', decor: ['👔', '⭐', '🏆', '🍫', '⭐'],
    fondo: 'bg-gradient-to-br from-sky-100 via-blue-100 to-slate-100', borde: 'border-2 border-sky-400',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-sky-800', boton: 'bg-sky-700 text-white hover:bg-sky-800',
    subtitulo: 'Un detalle dulce para papá' },
  sanvalentin: { nombre: 'San Valentín',    emoji: '💘', decor: ['💘', '💌', '❤️', '🌹', '💘'],
    fondo: 'bg-gradient-to-br from-red-100 via-rose-100 to-pink-200', borde: 'border-2 border-red-400',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-red-700', boton: 'bg-red-600 text-white hover:bg-red-700',
    subtitulo: 'Dulces para decir te quiero' },
  amigo:       { nombre: 'Día del Amigo',   emoji: '🤝', decor: ['🤝', '🎉', '💛', '🍬', '🎈'],
    fondo: 'bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100', borde: 'border-2 border-amber-400',
    titulo: 'text-slate-900', texto: 'text-slate-700', badge: 'bg-white text-amber-800', boton: 'bg-amber-600 text-slate-900 hover:bg-amber-500',
    subtitulo: 'Regalale algo dulce a tu amigo' },
};

// Clave segura para Firebase a partir del nombre de la categoría.
export const slugCategoria = nombre => (nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const hoyISO = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD en hora local
export const vigente = f => !f.hasta || hoyISO() <= f.hasta;
