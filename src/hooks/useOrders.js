import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../firebase';
import * as svc from '../services/ordersService';

// SOLO para el panel admin: pasale habilitado={loggedIn}. Los clientes nunca descargan pedidos ni clientes.
export function useOrders({ habilitado = true, notificar = true } = {}){
  const [mapaPedidos, setMapaPedidos] = useState({});
  const [mapaClientes, setMapaClientes] = useState({});
  const [cargando, setCargando] = useState(habilitado);
  const conocidos = useRef(null);

  useEffect(() => {
    if(!habilitado) return;
    const pRef = db.ref('pedidos');
    const cRef = db.ref('clientes');
    const onPedidos = snap => {
      const val = snap.val() || {};
      const ids = Object.keys(val);
      if(notificar && conocidos.current){
        ids.filter(id => !conocidos.current.has(id)).forEach(id => {
          if(typeof Notification !== 'undefined' && Notification.permission === 'granted'){
            new Notification('Nuevo pedido en Dulce Benjamín', { body: `${val[id].nombre} - $${val[id].total}` });
          }
        });
      }
      conocidos.current = new Set(ids);
      setMapaPedidos(val);
      setCargando(false);
    };
    const onClientes = snap => setMapaClientes(snap.val() || {});
    pRef.on('value', onPedidos);
    cRef.on('value', onClientes);
    return () => { pRef.off('value', onPedidos); cRef.off('value', onClientes); conocidos.current = null; };
  }, [habilitado, notificar]);

  const pedidos = useMemo(() => Object.entries(mapaPedidos)
    .map(([id, p]) => ({ id, ...p })).sort((a, b) => (b.creado || 0) - (a.creado || 0)), [mapaPedidos]);
  const clientes = useMemo(() => Object.entries(mapaClientes).map(([id, c]) => ({ id, ...c })), [mapaClientes]);
  const pendientes = useMemo(() => pedidos.filter(p => p.estado === 'recibido').length, [pedidos]);

  return {
    pedidos, clientes, pendientes, cargando,
    cambiarEstado: svc.cambiarEstadoPedido,
    registrarPago: svc.registrarPago,
    crearCliente: svc.crearCliente,
    pedirNotificaciones: () => { if(typeof Notification !== 'undefined') Notification.requestPermission(); },
  };
}
