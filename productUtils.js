// Helpers puros (sin React ni Firebase). Antes vivían sueltos arriba de App.jsx.
export const NOMBRE_NEGOCIO = "Dulce Benjamín";
export const IMG_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#FCE7F3'/><text x='50' y='62' font-size='40' text-anchor='middle'>🍬</text></svg>");

export const norm = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function imagenesDe(p){
  if(p.imagenes && p.imagenes.length) return p.imagenes;
  if(p.imagen) return [p.imagen];
  return [];
}
// Foto liviana para grillas, tarjetas y categorías (si el producto aún no se migró, cae a la foto completa).
export const miniaturaDe = p => p.miniatura || imagenesDe(p)[0] || '';
export function variantesDe(p){
  if(p.variantes && p.variantes.length) return p.variantes;
  if(p.precio) return [{cantidad: 1, precio: p.precio}];
  return [];
}
export const pagadoDe = pedido => Object.values(pedido.pagos || {}).reduce((a, p) => a + p.monto, 0);
export const debeDe = pedido => pedido.total - pagadoDe(pedido);
export const fechaCorta = ts => new Date(ts).toLocaleDateString('es-AR');
export const precioDesde = p => {
  const precios = variantesDe(p).map(v => v.precio);
  if(!precios.length) return '$0';
  return precios.length > 1 ? `Desde $${Math.min(...precios)}` : `$${precios[0]}`;
};
