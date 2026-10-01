// TODO: reemplazar por reseñas reales de clientes.
const RESENAS = [
  { nombre: 'Lucía M.', evento: 'Cumpleaños de 5 años', texto: 'Las cajitas quedaron hermosas y llegaron justo a tiempo. Los nenes y los grandes quedaron fascinados.' },
  { nombre: 'Carolina R.', evento: 'Candy bar de casamiento', texto: 'Atención de diez y una mesa dulce que fue el centro de la fiesta. Súper recomendable.' },
  { nombre: 'Martín G.', evento: 'Egreso de sala', texto: 'Pedí a último momento y me resolvieron todo. Muy buena calidad y precios justos.' },
];

export default function Testimonials(){
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 w-full" aria-labelledby="testimonios-titulo">
      <h2 id="testimonios-titulo" className="text-center text-2xl sm:text-3xl font-heading font-bold text-slate-900">Lo que dicen nuestros clientes</h2>
      <p className="text-center text-slate-600 text-sm mt-1 mb-8">Momentos dulces que ya compartimos</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {RESENAS.map(r => (
          <figure key={r.nombre} className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="text-amber-500 text-lg tracking-widest" role="img" aria-label="5 de 5 estrellas">★★★★★</div>
            <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed flex-1">“{r.texto}”</blockquote>
            <figcaption className="mt-4 pt-3 border-t border-pink-50">
              <p className="text-sm font-bold text-slate-800">{r.nombre}</p>
              <p className="text-xs text-slate-600">{r.evento}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
