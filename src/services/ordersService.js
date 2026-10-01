import { db } from '../firebase';

// Solo escribe: el cliente puede pedir sin descargar los pedidos de nadie.
export function crearPedido({ items, total, datos }){
  return db.ref('pedidos').push().set({
    items, total,
    nombre: datos.nombre, telefono: datos.telefono, zona: datos.zona, fecha: datos.fecha,
    estado: 'recibido', creado: Date.now(),
  });
}
export const cambiarEstadoPedido = (id, estado) => db.ref('pedidos/' + id + '/estado').set(estado);
export const registrarPago = (id, monto) => db.ref('pedidos/' + id + '/pagos').push().set({ monto, fecha: Date.now() });
export const crearCliente = (nombre, telefono) => db.ref('clientes').push().set({ nombre, telefono });

export function urlWhatsApp(whatsapp, items, total, datos){
  const l = ['✨ *Nuevo pedido desde la web* ✨\n'];
  items.forEach(i => l.push(`• ${i.unidades}x ${i.nombre} (Pack de ${i.cantidadPack}) - $${i.precioPack * i.unidades}`));
  l.push(`\n💰 *Total:* $${total}`, `👤 *Nombre:* ${datos.nombre}`, `📞 *Teléfono:* ${datos.telefono}`,
         `📍 *Zona:* ${datos.zona}`, `📅 *Fecha evento:* ${datos.fecha}`);
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(l.join('\n'))}`;
}
