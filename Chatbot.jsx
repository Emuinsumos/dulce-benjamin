import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { useChatbot } from '../../hooks/useChatbot';
import { useUiStore } from '../../store/useUiStore';
import { NOMBRE_NEGOCIO } from '../../lib/productUtils';

export default function Chatbot(){
  const { chatbotSaludo, chatbotPreguntas, chatbotListo, listaPreguntasBot, preguntasBotMostradas } = useChatbot();
  const { config } = useConfig();
  const { mostrarChat, mostrarPresupuestoPublico, abrirChat, cerrarChat, abrirPresupuestoPublico, cerrarPresupuestoPublico } = useUiStore();
  const setMostrarChat = v => (v ? abrirChat() : cerrarChat());
  const setMostrarPresupuestoPublico = v => (v ? abrirPresupuestoPublico() : cerrarPresupuestoPublico());
  const [historialChat, setHistorialChat] = useState([]);
  const chatFinRef = useRef(null);
  useEffect(() => {
    if(chatbotListo && historialChat.length===0){
      setHistorialChat([{tipo:'bot', texto: chatbotSaludo}]);
    }
  }, [chatbotListo]);
  useEffect(() => {
    if(chatFinRef.current) chatFinRef.current.scrollIntoView({behavior:'smooth'});
  }, [historialChat, mostrarChat]);
  function preguntarBot(item){
    setHistorialChat(prev => [...prev, {tipo:'user', texto:item.pregunta}, {tipo:'bot', texto:item.respuesta}]);
    if(item.accion === 'abrir_presupuesto'){
      setTimeout(() => { setMostrarChat(false); setMostrarPresupuestoPublico(true); }, 400);
    } else if(item.accion === 'contactar_whatsapp'){
      setTimeout(() => { if(config.whatsapp) window.open(`https://wa.me/${config.whatsapp}`, '_blank'); }, 400);
    }
  }

  return (
    <>
      {!mostrarChat && (
        <button onClick={()=>setMostrarChat(true)}
          className="fixed bottom-5 right-5 z-40 bg-brand-500 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:bg-brand-600 transition-all flex items-center justify-center text-2xl">
          💬
        </button>
      )}

      {mostrarChat && (
        <div className="fixed bottom-5 right-5 z-40 w-80 max-w-[calc(100%-2.5rem)] h-[440px] max-h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-brand-100">
          <div className="bg-brand-500 text-white p-3 flex justify-between items-center">
            <div>
              <p className="font-bold text-sm font-heading">{NOMBRE_NEGOCIO}</p>
              <p className="text-xs opacity-90">Asistente virtual</p>
            </div>
            <button onClick={()=>setMostrarChat(false)} className="text-xl leading-none">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-pink-50/60">
            {historialChat.map((m,idx)=>(
              <div key={idx} className={`flex ${m.tipo==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${m.tipo==='user' ? 'bg-brand-500 text-white' : 'bg-white text-slate-700 shadow'}`}>
                  {m.texto}
                </div>
              </div>
            ))}
            <div ref={chatFinRef}></div>
          </div>

          <div className="p-2 border-t bg-white flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {preguntasBotMostradas.map((item,idx)=>(
              <button key={item.id || idx} onClick={()=>preguntarBot(item)}
                className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1.5 rounded-full hover:bg-brand-100 transition-all">
                {item.pregunta}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
