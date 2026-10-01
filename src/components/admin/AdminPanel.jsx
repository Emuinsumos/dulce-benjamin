import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { confirmar } from '../../lib/confirm';
import { resizeImagen, miniaturaDesdeDataUrl } from '../../lib/image';
import { guardarFotos, obtenerFotos, borrarFotos } from '../../services/photosService';
import { useProducts } from '../../hooks/useProducts';
import { useConfig } from '../../hooks/useConfig';
import { useOrders } from '../../hooks/useOrders';
import { useChatbot } from '../../hooks/useChatbot';
import { useCartStore } from '../../store/useCartStore';
import { useAdminStore } from '../../store/useAdminStore';
import { NOMBRE_NEGOCIO, imagenesDe, variantesDe, pagadoDe, debeDe, fechaCorta } from '../../lib/productUtils';

export default function AdminPanel(){
  const { chatbotSaludo, chatbotPreguntas, chatbotListo, listaPreguntasBot, preguntasBotMostradas } = useChatbot();
  // --- Estado global (fase 2): carrito, sesión admin, UI y datos vienen de stores/hooks ---
  const { productos: listaProductos, mapa: productos, categorias } = useProducts();
  const { config } = useConfig();
  const carrito = useCartStore(s => s.items);
  const { loggedIn, mostrarLogin, mostrarAdmin, adminTab, errorLogin, abrirLogin, cerrarLogin, abrirAdmin, cerrarAdmin, setTab, login, logout } = useAdminStore();
  const setMostrarAdmin = v => (v ? abrirAdmin() : cerrarAdmin());
  const setAdminTab = setTab;
  const { pedidos: listaPedidos, clientes: listaClientes, pendientes: pedidosPendientes } = useOrders({ habilitado: true, notificar: false });
  function cerrarSesion(){ logout(); }
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [migracion, setMigracion] = useState({ activa: false, hecho: 0, total: 0 });
  const [form, setForm] = useState({nombre:'', categoria:'', descripcion:'', imagenes:[], agotado:false, variantes:[{cantidad:'1', precio:''}]});
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [instagramInput, setInstagramInput] = useState('');
  const [montoPagoInputs, setMontoPagoInputs] = useState({});
  const [presClienteNombre, setPresClienteNombre] = useState('');
  const [presClienteTelefono, setPresClienteTelefono] = useState('');
  const [presItems, setPresItems] = useState([]);
  const [presProductoId, setPresProductoId] = useState('');
  const [presVarianteIdx, setPresVarianteIdx] = useState(0);
  const [presCantidad, setPresCantidad] = useState('1');
  const [presOtroNombre, setPresOtroNombre] = useState('');
  const [presOtroPrecio, setPresOtroPrecio] = useState('');
  const [aumentoPorcentaje, setAumentoPorcentaje] = useState('');
  const [aumentoRedondeo, setAumentoRedondeo] = useState('1000');
  const [saludoBotInput, setSaludoBotInput] = useState('');
  const [chatbotForm, setChatbotForm] = useState({pregunta:'', respuesta:'', accion:''});
  const [editandoChatbotId, setEditandoChatbotId] = useState(null);
  useEffect(() => { setWhatsappInput(config.whatsapp || ''); setInstagramInput(config.instagram || ''); }, [config]);
  const total = carrito.reduce((acc,i)=>acc+i.precioPack*i.unidades,0);
  function pedirNotificaciones(){
    if(typeof Notification !== 'undefined') Notification.requestPermission();
  }
  function cambiarEstadoPedido(id, estado){
    db.ref('pedidos/'+id+'/estado').set(estado);
  }
  function registrarPago(pedido){
    const monto = Number(montoPagoInputs[pedido.id]);
    if(!monto || monto<=0) return;
    db.ref('pedidos/'+pedido.id+'/pagos').push().set({monto, fecha: Date.now()});
    setMontoPagoInputs(prev => ({...prev, [pedido.id]: ''}));
  }
  function generarRecibo(pedido, pago){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(219,39,119);
    doc.text(NOMBRE_NEGOCIO, 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(80,80,80);
    doc.text('Recibo de pago', 14, 32);
    doc.setFontSize(11);
    doc.text(`Cliente: ${pedido.nombre}`, 14, 44);
    doc.text(`Fecha de pago: ${fechaCorta(pago.fecha)}`, 14, 51);
    doc.text(`Monto pagado: $${pago.monto}`, 14, 58);
    doc.text(`Total del pedido: $${pedido.total}`, 14, 65);
    doc.text(`Saldo restante: $${debeDe(pedido)}`, 14, 72);
    doc.save(`recibo-${pedido.nombre.replace(/\s+/g,'_')}-${fechaCorta(pago.fecha).replace(/\//g,'-')}.pdf`);
  }
  function editarProducto(p){
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      imagenes: imagenesDe(p),
      agotado: !!p.agotado,
      variantes: variantesDe(p).map(v=>({cantidad:String(v.cantidad), precio:String(v.precio)}))
    });
    setEditandoId(p.id);
    setAdminTab('productos');
    // Fotos completas: si no vienen dentro del producto, se traen de /fotos.
    if(imagenesDe(p).length === 0){
      setCargandoFotos(true);
      obtenerFotos(p.id)
        .then(f => setForm(cur => ({ ...cur, imagenes: f })))
        .catch(() => toast.error('No se pudieron cargar las fotos del producto'))
        .finally(() => setCargandoFotos(false));
    }
  }
  function resetForm(){
    setForm({nombre:'', categoria:'', descripcion:'', imagenes:[], agotado:false, variantes:[{cantidad:'1', precio:''}]});
    setEditandoId(null);
  }
  async function guardarProducto(){
    const variantesValidas = form.variantes.filter(v=>v.cantidad && v.precio).map(v=>({cantidad:Number(v.cantidad), precio:Number(v.precio)}));
    if(!form.nombre || !form.categoria || variantesValidas.length===0) return;
    if(cargandoFotos){ toast('Esperá un segundo: se están cargando las fotos del producto.'); return; }
    const id = editandoId || db.ref('productos').push().key;
    const editando = !!editandoId;
    try{
      // Catálogo liviano: solo una miniatura; las fotos completas van aparte, en /fotos.
      const miniatura = form.imagenes.length ? await miniaturaDesdeDataUrl(form.imagenes[0]) : '';
      await guardarFotos(id, form.imagenes);
      await db.ref('productos/'+id).set({
        nombre: form.nombre,
        categoria: form.categoria,
        descripcion: form.descripcion || '',
        miniatura,
        agotado: form.agotado,
        variantes: variantesValidas
      });
      toast.success(editando ? 'Producto actualizado' : 'Producto guardado');
      resetForm();
    }catch(err){
      console.error(err);
      toast.error('No se pudo guardar el producto');
    }
  }
  async function migrarFotos(){
    const pendientes = listaProductos.filter(p => imagenesDe(p).some(i => i.startsWith('data:')));
    if(!pendientes.length) return;
    if(!(await confirmar(`Se van a optimizar las fotos de ${pendientes.length} productos. Dejá la pantalla abierta hasta que termine.`, { si: 'Optimizar' }))) return;
    setMigracion({ activa: true, hecho: 0, total: pendientes.length });
    let ok = 0;
    for(const p of pendientes){
      try{
        const imgs = imagenesDe(p);
        const miniatura = await miniaturaDesdeDataUrl(imgs[0]);
        await guardarFotos(p.id, imgs);                                   // 1) primero se copian las fotos
        await db.ref('productos/'+p.id).update({ miniatura, imagenes: null, imagen: null }); // 2) recién después se aliviana el producto
        ok++;
      }catch(err){ console.error('No se pudo migrar', p.id, err); }
      setMigracion(m => ({ ...m, hecho: m.hecho + 1 }));
    }
    setMigracion({ activa: false, hecho: 0, total: 0 });
    toast.success(`Listo: ${ok} de ${pendientes.length} productos optimizados`);
  }
  async function eliminarProducto(id){
    if(await confirmar('¿Eliminar este producto?', { si: 'Eliminar' })){
      db.ref('productos/'+id).remove().then(() => { borrarFotos(id); toast.success('Producto eliminado'); });
    }
  }
  function handleImagenes(e){
    const files = Array.from(e.target.files);
    files.forEach(file => {
      resizeImagen(file, (dataUrl) => setForm(f => ({...f, imagenes: [...f.imagenes, dataUrl]})), 800);
    });
    e.target.value = '';
  }
  function quitarImagenForm(idx){
    setForm(f => ({...f, imagenes: f.imagenes.filter((_,i)=>i!==idx)}));
  }
  function cambiarVariante(idx, campo, valor){
    setForm(f => ({...f, variantes: f.variantes.map((v,i)=> i===idx ? {...v, [campo]: valor} : v)}));
  }
  function agregarFilaVariante(){
    setForm(f => ({...f, variantes: [...f.variantes, {cantidad:'', precio:''}]}));
  }
  function quitarFilaVariante(idx){
    setForm(f => ({...f, variantes: f.variantes.filter((_,i)=>i!==idx)}));
  }
  function moverCategoria(c, dir){
    const i = categorias.indexOf(c), j = i + dir;
    if(i < 0 || j < 0 || j >= categorias.length) return;
    const arr = [...categorias]; [arr[i], arr[j]] = [arr[j], arr[i]];
    db.ref('categorias').set(arr);
  }
  function agregarCategoria(){
    if(!nuevaCategoria || categorias.includes(nuevaCategoria)) return;
    db.ref('categorias').set([...categorias, nuevaCategoria]).then(() => toast.success('Categoría agregada'));
    setNuevaCategoria('');
  }
  function eliminarCategoria(cat){
    db.ref('categorias').set(categorias.filter(c => c !== cat));
  }
  function guardarConfig(){
    db.ref('config').set({...config, whatsapp: whatsappInput, instagram: instagramInput}).then(() => toast.success('Configuración guardada'));
  }
  function handleLogo(e){
    const file = e.target.files[0];
    if(!file) return;
    resizeImagen(file, (dataUrl) => {
      db.ref('config').set({...config, whatsapp: whatsappInput, instagram: instagramInput, logo: dataUrl});
    }, 300);
  }
  async function aplicarAumento(){
    const pct = Number(aumentoPorcentaje);
    const redondeo = Number(aumentoRedondeo);
    if(!pct || !redondeo) return;
    if(!(await confirmar(`¿Aumentar todos los precios un ${pct}% redondeando a $${redondeo}? No se puede deshacer.`, { si: 'Aumentar' }))) return;
    const actualizados = {};
    Object.entries(productos).forEach(([id,p]) => {
      const nuevasVariantes = variantesDe(p).map(v => {
        const nuevo = v.precio * (1 + pct/100);
        return {cantidad: v.cantidad, precio: Math.round(nuevo/redondeo)*redondeo};
      });
      actualizados[id] = {...p, variantes: nuevasVariantes};
    });
    db.ref('productos').set(actualizados).then(() => toast.success('Precios actualizados'));
    setAumentoPorcentaje('');
  }
  function guardarClienteNuevo(){
    if(!presClienteNombre) return;
    const yaExiste = listaClientes.find(c => c.nombre.toLowerCase()===presClienteNombre.toLowerCase());
    if(yaExiste) return;
    db.ref('clientes').push().set({nombre: presClienteNombre, telefono: presClienteTelefono});
  }
  function elegirClienteExistente(id){
    if(!id) { setPresClienteNombre(''); setPresClienteTelefono(''); return; }
    const c = listaClientes.find(x => x.id === id);
    if(!c) return;
    setPresClienteNombre(c.nombre);
    setPresClienteTelefono(c.telefono || '');
  }
  function agregarItemPresupuesto(){
    if(!presProductoId) return;
    const p = productos[presProductoId];
    const variante = variantesDe(p)[presVarianteIdx];
    const cant = Number(presCantidad) || 1;
    setPresItems(prev => [...prev, {nombre: `${p.nombre} (pack ${variante.cantidad})`, cantidad: cant, precio: variante.precio}]);
    setPresCantidad('1');
  }
  function agregarItemLibre(){
    if(!presOtroNombre || !presOtroPrecio) return;
    setPresItems(prev => [...prev, {nombre: presOtroNombre, cantidad: 1, precio: Number(presOtroPrecio)}]);
    setPresOtroNombre(''); setPresOtroPrecio('');
  }
  function quitarItemPresupuesto(idx){
    setPresItems(prev => prev.filter((_,i)=>i!==idx));
  }
  const totalPresupuesto = presItems.reduce((a,it)=>a+it.cantidad*it.precio,0);
  function generarPresupuestoPDF(){
    if(!presClienteNombre || presItems.length===0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    if(config.logo){
      try{
        const fmt = config.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(config.logo, fmt, 160, 10, 35, 35);
      }catch(e){}
    }
    doc.setFontSize(20);
    doc.setTextColor(219,39,119);
    doc.text(NOMBRE_NEGOCIO, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(90,90,90);
    doc.text(`Presupuesto para: ${presClienteNombre}`, 14, 32);
    if(presClienteTelefono) doc.text(`Teléfono: ${presClienteTelefono}`, 14, 38);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 44);

    const filas = presItems.map(it => [it.nombre, String(it.cantidad), `$${it.precio}`, `$${it.cantidad*it.precio}`]);
    doc.autoTable({
      head: [['Producto','Cantidad','Precio unit.','Subtotal']],
      body: filas,
      startY: 52,
      theme: 'grid',
      headStyles: {fillColor:[244,114,182]}
    });

    doc.setFontSize(14);
    doc.setTextColor(219,39,119);
    doc.text(`Total: $${totalPresupuesto}`, 14, doc.lastAutoTable.finalY + 12);
    doc.setFontSize(10);
    doc.setTextColor(150,150,150);
    doc.text('¡Gracias por elegirnos! Cualquier consulta, escribinos.', 14, doc.lastAutoTable.finalY + 22);

    doc.save(`presupuesto-${presClienteNombre.replace(/\s+/g,'_')}.pdf`);
  }
  function guardarSaludoBot(){
    db.ref('chatbot/saludo').set(saludoBotInput).then(() => toast.success('Saludo guardado'));
  }
  function editarPreguntaBot(item){
    setChatbotForm({pregunta:item.pregunta, respuesta:item.respuesta, accion:item.accion || ''});
    setEditandoChatbotId(item.id);
  }
  function resetFormChatbot(){
    setChatbotForm({pregunta:'', respuesta:'', accion:''});
    setEditandoChatbotId(null);
  }
  function guardarPreguntaBot(){
    if(!chatbotForm.pregunta || !chatbotForm.respuesta) return;
    const id = editandoChatbotId || db.ref('chatbot/preguntas').push().key;
    db.ref('chatbot/preguntas/'+id).set({
      pregunta: chatbotForm.pregunta,
      respuesta: chatbotForm.respuesta,
      accion: chatbotForm.accion || ''
    }).then(() => toast.success('Pregunta guardada'));
    resetFormChatbot();
  }
  function eliminarPreguntaBot(id){
    db.ref('chatbot/preguntas/'+id).remove().then(() => toast.success('Pregunta eliminada'));
  }
  const ESTADOS = [
    {key:'recibido', label:'Recibido', color:'bg-amber-400'},
    {key:'en_proceso', label:'En proceso', color:'bg-sky-400'},
    {key:'entregado', label:'Entregado', color:'bg-emerald-500'},
    {key:'rechazado', label:'Rechazado', color:'bg-rose-500'}
  ];
  const ahora = new Date();
  const pedidosConfirmados = listaPedidos.filter(p => p.estado==='en_proceso' || p.estado==='entregado');
  const pedidosDelMes = pedidosConfirmados.filter(p => {
    const d = new Date(p.creado||0);
    return d.getMonth()===ahora.getMonth() && d.getFullYear()===ahora.getFullYear();
  });
  const totalVendidoMes = pedidosDelMes.reduce((a,p)=>a+p.total,0);
  const totalCobradoGlobal = pedidosConfirmados.reduce((a,p)=>a+pagadoDe(p),0);
  const totalPendienteGlobal = pedidosConfirmados.reduce((a,p)=>a+Math.max(debeDe(p),0),0);
  const rankingProductos = (() => {
    const conteo = {};
    pedidosConfirmados.forEach(p => (p.items||[]).forEach(it => { conteo[it.nombre] = (conteo[it.nombre]||0) + it.unidades; }));
    return Object.entries(conteo).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();
  const maxRanking = rankingProductos.length ? rankingProductos[0][1] : 1;
  useEffect(() => { setSaludoBotInput(chatbotSaludo); }, [chatbotSaludo]);

  return (
    <>
      {mostrarAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50" onClick={()=>setMostrarAdmin(false)}>
          <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-heading font-bold text-slate-800">Panel de Administración</h2>
              <div className="flex items-center gap-3">
                <button onClick={cerrarSesion} className="text-xs text-rose-500 hover:underline">Salir</button>
                <button onClick={()=>setMostrarAdmin(false)} className="text-slate-400">✕</button>
              </div>
            </div>

            <div className="mt-4 mb-4">
              <button onClick={pedirNotificaciones} className="w-full text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl p-2.5 font-medium transition flex items-center justify-center gap-2">
                <span>🔔</span> Activar notificaciones de nuevos pedidos
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100">
              {['tablero','productos','categorias','negocio','pedidos','presupuestos','chatbot'].map(tab=>(
                <button key={tab} onClick={()=>setAdminTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                    adminTab===tab ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}>
                  {tab==='tablero'?'📊 Tablero':tab==='productos'?'Productos':tab==='categorias'?'Categorías':tab==='negocio'?'Config':tab==='pedidos'?`Pedidos (${pedidosPendientes})`:tab==='presupuestos'?'Presupuestos':'🤖 Bot'}
                </button>
              ))}
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
              {adminTab==='tablero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-brand-500 to-pink-400 rounded-2xl p-4 text-white shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Ventas del mes</p>
                      <p className="text-2xl font-heading font-bold">${totalVendidoMes}</p>
                      <p className="text-[11px] opacity-90">💰 {pedidosDelMes.length} pedidos</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl p-4 text-white shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Total Cobrado</p>
                      <p className="text-2xl font-heading font-bold">${totalCobradoGlobal}</p>
                      <p className="text-[11px] opacity-90">✅ Acumulado</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl p-4 text-white shadow-sm col-span-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Pendiente de cobro</p>
                      <p className="text-2xl font-heading font-bold">${totalPendienteGlobal}</p>
                      <p className="text-[11px] opacity-90">⏳ Entre pedidos activos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {ESTADOS.map(e=>(
                      <div key={e.key} className={`${e.color} rounded-xl p-2.5 text-white text-center shadow-sm`}>
                        <p className="text-base font-bold font-heading">{listaPedidos.filter(p=>p.estado===e.key).length}</p>
                        <p className="text-[10px] uppercase font-semibold">{e.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">🏆 Lo más vendido</h3>
                    {rankingProductos.length===0 && <p className="text-slate-400 text-xs">Sin información de ventas aún.</p>}
                    {rankingProductos.map(([nombre,cant])=>(
                      <div key={nombre} className="mb-2.5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700">{nombre}</span>
                          <span className="font-bold text-slate-500">{cant} u.</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{width: `${(cant/maxRanking)*100}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab==='productos' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-700 mb-2">💲 Aumento Masivo</h3>
                    <div className="flex gap-2 mb-2">
                      <input value={aumentoPorcentaje} onChange={e=>setAumentoPorcentaje(e.target.value)} type="number" placeholder="% Aumento" className="border rounded-xl p-2 text-xs flex-1 bg-white"/>
                      <select value={aumentoRedondeo} onChange={e=>setAumentoRedondeo(e.target.value)} className="border rounded-xl p-2 text-xs bg-white">
                        <option value="500">Redondear a $500</option>
                        <option value="1000">Redondear a $1000</option>
                      </select>
                    </div>
                    <button onClick={aplicarAumento} className="w-full bg-purple-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition">Aplicar cambio general</button>
                  </div>

                  {(() => {
                    const pesados = listaProductos.filter(p => imagenesDe(p).some(i => i.startsWith('data:'))).length;
                    if(!pesados && !migracion.activa) return null;
                    return (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-1">Optimizar fotos</h3>
                        <p className="text-xs text-amber-900 mb-3 leading-relaxed">
                          {migracion.activa
                            ? `Optimizando… ${migracion.hecho} de ${migracion.total}. No cierres esta pantalla.`
                            : `${pesados} producto${pesados === 1 ? '' : 's'} tiene${pesados === 1 ? '' : 'n'} las fotos completas dentro del catálogo, y eso hace lenta la web. Al optimizar, el catálogo usa miniaturas y la foto completa se carga solo al abrir el producto.`}
                        </p>
                        <button onClick={migrarFotos} disabled={migracion.activa}
                          className="w-full bg-amber-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition disabled:opacity-50">
                          {migracion.activa ? 'Trabajando…' : 'Optimizar fotos ahora'}
                        </button>
                      </div>
                    );
                  })()}

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">{editandoId ? 'Editar producto' : 'Nuevo producto'}</h3>
                    <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Nombre del producto" className="w-full border rounded-xl p-2.5 text-xs mb-2 bg-white"/>
                    <select value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} className="w-full border rounded-xl p-2.5 text-xs mb-2 bg-white">
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} placeholder="Descripción detallada" className="w-full border rounded-xl p-2.5 text-xs mb-3 bg-white" rows="2"></textarea>

                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Precios / Cantidades</label>
                    {form.variantes.map((v,idx)=>(
                      <div key={idx} className="flex gap-2 mb-2 items-center">
                        <input value={v.cantidad} onChange={e=>cambiarVariante(idx,'cantidad',e.target.value)} type="number" placeholder="Cant." className="border rounded-xl p-2 text-xs w-20 bg-white"/>
                        <span className="text-xs text-slate-400">pack = $</span>
                        <input value={v.precio} onChange={e=>cambiarVariante(idx,'precio',e.target.value)} type="number" placeholder="Precio" className="border rounded-xl p-2 text-xs flex-1 bg-white"/>
                        {form.variantes.length>1 && <button onClick={()=>quitarFilaVariante(idx)} className="text-rose-500 text-xs">✕</button>}
                      </div>
                    ))}
                    <button onClick={agregarFilaVariante} className="text-xs text-brand-600 font-semibold mb-3 block">+ Variante adicional</button>

                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input type="checkbox" checked={form.agotado} onChange={e=>setForm({...form, agotado:e.target.checked})} className="rounded text-brand-500 focus:ring-brand-500"/>
                      <span className="text-xs text-slate-600">Marcar producto como Agotado</span>
                    </label>

                    <input type="file" accept="image/*" multiple onChange={handleImagenes} className="w-full text-xs text-slate-500 mb-2"/>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {form.imagenes.map((img,idx)=>(
                        <div key={idx} className="relative w-14 h-14">
                          <img src={img} className="w-full h-full object-cover rounded-xl border"/>
                          <button onClick={()=>quitarImagenForm(idx)} className="absolute -top-1 -right-1 bg-rose-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">✕</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={guardarProducto} className="flex-1 bg-brand-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-600 transition">{editandoId ? 'Guardar Cambios' : 'Crear Producto'}</button>
                      {editandoId && <button onClick={resetForm} className="px-4 bg-slate-200 text-slate-600 rounded-xl text-xs">Cancelar</button>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Catálogo actual</h3>
                    {listaProductos.map(p => (
                      <div key={p.id} className="flex justify-between items-center border border-slate-100 rounded-xl p-3 bg-white">
                        <span className="text-xs font-medium text-slate-700">{p.nombre} <span className="text-slate-400">({p.categoria})</span></span>
                        <div className="flex gap-2">
                          <button onClick={()=>editarProducto(p)} className="text-xs text-sky-600 font-semibold">Editar</button>
                          <button onClick={()=>eliminarProducto(p.id)} className="text-xs text-rose-500 font-semibold">Borrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab==='categorias' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input value={nuevaCategoria} onChange={e=>setNuevaCategoria(e.target.value)} placeholder="Nombre de categoría" className="border rounded-xl flex-1 p-2.5 text-xs"/>
                    <button onClick={agregarCategoria} className="bg-brand-500 text-white px-4 rounded-xl text-xs font-bold hover:bg-brand-600">Agregar</button>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-400">Usá ▲▼ para ordenar: es el orden en que las ve el cliente (las categorías sin productos no se muestran).</p>
                    {categorias.map((c, i) => (
                      <div key={c} className="flex justify-between items-center gap-2 border border-slate-100 p-2.5 rounded-xl text-xs">
                        <span className="text-slate-700 font-medium flex-1 min-w-0 truncate">{c}</span>
                        <button onClick={()=>moverCategoria(c,-1)} disabled={i===0} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30">▲</button>
                        <button onClick={()=>moverCategoria(c,1)} disabled={i===categorias.length-1} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30">▼</button>
                        <button onClick={()=>eliminarCategoria(c)} className="text-rose-500 font-semibold">Borrar</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab==='negocio' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Logo Negocio</label>
                    {config.logo && <img src={config.logo} className="w-16 h-16 object-cover rounded-2xl mb-2 border"/>}
                    <input type="file" accept="image/*" onChange={handleLogo} className="w-full text-xs text-slate-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">WhatsApp (Número internacional)</label>
                    <input value={whatsappInput} onChange={e=>setWhatsappInput(e.target.value)} placeholder="Ej: 5491122334455" className="w-full border rounded-xl p-2.5 text-xs"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Instagram (Usuario sin @)</label>
                    <input value={instagramInput} onChange={e=>setInstagramInput(e.target.value)} placeholder="Ej: dulcebenjamin" className="w-full border rounded-xl p-2.5 text-xs"/>
                  </div>
                  <button onClick={guardarConfig} className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-600">Guardar Configuración</button>
                </div>
              )}

              {adminTab==='pedidos' && (
                <div className="space-y-3">
                  {listaPedidos.length===0 && <p className="text-slate-400 text-xs text-center py-6">No hay pedidos registrados.</p>}
                  {listaPedidos.map(ped => {
                    const pagado = pagadoDe(ped);
                    const debe = debeDe(ped);
                    const pagosArr = Object.entries(ped.pagos||{}).map(([id,pg])=>({id,...pg})).sort((a,b)=>a.fecha-b.fecha);
                    return (
                      <div key={ped.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs text-slate-800">{ped.nombre}</p>
                            <p className="text-[11px] text-slate-400">{ped.telefono} · {ped.zona}</p>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">{fechaCorta(ped.creado)}</span>
                        </div>
                        
                        <div className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                          {(ped.items||[]).map((it,idx)=>(
                            <p key={idx}>{it.unidades}x {it.nombre} (Pack {it.cantidadPack})</p>
                          ))}
                        </div>

                        <div className="flex justify-between text-xs pt-1">
                          <span className="font-bold text-slate-700">Total: ${ped.total}</span>
                          <span className={debe>0 ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'}>
                            {debe>0 ? `Debe: $${debe}` : 'Saldado ✓'}
                          </span>
                        </div>

                        {pagosArr.length>0 && (
                          <div className="space-y-1">
                            {pagosArr.map(pg=>(
                              <div key={pg.id} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded-lg border">
                                <span>{fechaCorta(pg.fecha)} — ${pg.monto}</span>
                                <button onClick={()=>generarRecibo(ped,pg)} className="text-sky-600 font-semibold">Receipt 🧾</button>
                              </div>
                            ))}
                          </div>
                        )}

                        {debe>0 && (
                          <div className="flex gap-2">
                            <input value={montoPagoInputs[ped.id]||''} onChange={e=>setMontoPagoInputs(prev=>({...prev,[ped.id]:e.target.value}))} type="number" placeholder="Monto pago" className="border rounded-xl p-2 text-xs flex-1 bg-white"/>
                            <button onClick={()=>registrarPago(ped)} className="bg-emerald-500 text-white px-3 rounded-xl text-xs font-bold hover:bg-emerald-600">Registrar</button>
                          </div>
                        )}

                        <div className="flex gap-1.5 flex-wrap pt-2">
                          {ESTADOS.map(e=>(
                            <button key={e.key} onClick={()=>cambiarEstadoPedido(ped.id, e.key)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition ${ped.estado===e.key ? e.color : 'bg-slate-300'}`}>
                              {e.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {adminTab==='presupuestos' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <select onChange={e=>elegirClienteExistente(e.target.value)} className="w-full border rounded-xl p-2.5 text-xs bg-white">
                      <option value="">-- Seleccionar cliente guardado --</option>
                      {listaClientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <input value={presClienteNombre} onChange={e=>setPresClienteNombre(e.target.value)} placeholder="Nombre cliente" className="w-full border rounded-xl p-2.5 text-xs"/>
                    <input value={presClienteTelefono} onChange={e=>setPresClienteTelefono(e.target.value)} placeholder="Teléfono" className="w-full border rounded-xl p-2.5 text-xs"/>
                    <button onClick={guardarClienteNuevo} className="text-xs text-brand-600 font-semibold">+ Guardar en directorio</button>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Agregar del catálogo</h4>
                    <select value={presProductoId} onChange={e=>{setPresProductoId(e.target.value); setPresVarianteIdx(0);}} className="w-full border rounded-xl p-2.5 text-xs bg-white">
                      <option value="">Seleccionar producto</option>
                      {listaProductos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    {presProductoId && (
                      <select value={presVarianteIdx} onChange={e=>setPresVarianteIdx(Number(e.target.value))} className="w-full border rounded-xl p-2.5 text-xs bg-white">
                        {variantesDe(productos[presProductoId]).map((v,idx)=>(
                          <option key={idx} value={idx}>{v.cantidad} u. — ${v.precio}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2">
                      <input value={presCantidad} onChange={e=>setPresCantidad(e.target.value)} type="number" placeholder="Cant." className="border rounded-xl p-2 text-xs w-20"/>
                      <button onClick={agregarItemPresupuesto} className="flex-1 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600">Agregar</button>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Agregar ítem libre</h4>
                    <div className="flex gap-2">
                      <input value={presOtroNombre} onChange={e=>setPresOtroNombre(e.target.value)} placeholder="Ej: Envío personalizado" className="border rounded-xl p-2 text-xs flex-1"/>
                      <input value={presOtroPrecio} onChange={e=>setPresOtroPrecio(e.target.value)} type="number" placeholder="Precio" className="border rounded-xl p-2 text-xs w-20"/>
                      <button onClick={agregarItemLibre} className="bg-brand-500 text-white px-3 rounded-xl text-xs font-bold">+</button>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    {presItems.map((it,idx)=>(
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                        <span>{it.cantidad}x {it.nombre} — ${it.cantidad*it.precio}</span>
                        <button onClick={()=>quitarItemPresupuesto(idx)} className="text-rose-500">🗑</button>
                      </div>
                    ))}
                    <p className="font-bold text-sm text-right text-slate-800">Total: ${totalPresupuesto}</p>
                    <button onClick={generarPresupuestoPDF} className="w-full bg-brand-500 text-white py-3 rounded-2xl text-xs font-bold hover:bg-brand-600 transition shadow-md">📄 Generar PDF del presupuesto</button>
                  </div>
                </div>
              )}

              {adminTab==='chatbot' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Mensaje de saludo</label>
                    <textarea value={saludoBotInput} onChange={e=>setSaludoBotInput(e.target.value)} rows="2" className="w-full border rounded-xl p-2.5 text-xs"></textarea>
                    <button onClick={guardarSaludoBot} className="mt-2 w-full bg-brand-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-brand-600">Guardar saludo</button>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">{editandoChatbotId ? 'Editar pregunta' : 'Nueva pregunta'}</h4>
                    <input value={chatbotForm.pregunta} onChange={e=>setChatbotForm({...chatbotForm, pregunta:e.target.value})} placeholder="Pregunta (ej: ¿Hacen envíos?)" className="w-full border rounded-xl p-2.5 text-xs"/>
                    <textarea value={chatbotForm.respuesta} onChange={e=>setChatbotForm({...chatbotForm, respuesta:e.target.value})} placeholder="Respuesta" rows="3" className="w-full border rounded-xl p-2.5 text-xs"></textarea>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Al responder, además...</label>
                    <select value={chatbotForm.accion} onChange={e=>setChatbotForm({...chatbotForm, accion:e.target.value})} className="w-full border rounded-xl p-2.5 text-xs bg-white">
                      <option value="">No hacer nada más</option>
                      <option value="abrir_presupuesto">Abrir la calculadora de presupuesto</option>
                      <option value="contactar_whatsapp">Llevar a WhatsApp</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={guardarPreguntaBot} className="flex-1 bg-brand-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-brand-600">{editandoChatbotId ? 'Guardar cambios' : 'Agregar pregunta'}</button>
                      {editandoChatbotId && <button onClick={resetFormChatbot} className="px-4 bg-slate-100 rounded-xl text-xs font-bold">Cancelar</button>}
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Preguntas cargadas</h4>
                    {listaPreguntasBot.length===0 && <p className="text-slate-400 text-xs">Todavía no cargaste preguntas propias — se están usando las de ejemplo.</p>}
                    {listaPreguntasBot.map(item => (
                      <div key={item.id} className="flex justify-between items-center border border-slate-100 p-2.5 rounded-xl text-xs">
                        <span className="text-slate-700 font-medium truncate pr-2">{item.pregunta}</span>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={()=>editarPreguntaBot(item)} className="text-blue-500 font-semibold">Editar</button>
                          <button onClick={()=>eliminarPreguntaBot(item.id)} className="text-rose-500 font-semibold">Borrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
