import { useConfig } from '../../hooks/useConfig';

// Foto de fondo opcional: si en config existe "heroFoto" (URL), se usa; si no, queda el degradé rosa.
export default function Hero({ onVerProductos }){
  const { config } = useConfig();
  const foto = config.heroFoto;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-brand-50 to-white" aria-labelledby="hero-titulo">
      {foto && (
        <>
          <img src={foto} alt="" className="absolute inset-0 w-full h-full object-cover" decoding="async" />
          <div className="absolute inset-0 bg-white/70"></div>
        </>
      )}
      <span className="absolute -top-4 left-4 text-6xl opacity-20 select-none" aria-hidden="true">🍭</span>
      <span className="absolute bottom-2 right-6 text-7xl opacity-20 select-none" aria-hidden="true">🧁</span>
      <span className="absolute top-1/2 right-1/4 text-5xl opacity-10 select-none hidden sm:block" aria-hidden="true">🍬</span>

      <div className="relative max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center">
        <p className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm mb-4">
          Candy bar y cajitas dulces
        </p>
        <h1 id="hero-titulo" className="text-4xl sm:text-6xl font-heading font-bold text-slate-900 leading-tight tracking-tight">
          Endulzamos tus momentos <span className="text-brand-600">más especiales</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed">
          Cajitas, candy bar y combos dulces para tus cumpleaños, casamientos y todos tus festejos.
        </p>
        <button onClick={onVerProductos}
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 text-white text-base font-bold shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition">
          Ver productos <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}
