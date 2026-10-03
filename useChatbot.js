import { useEffect, useMemo } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { DEFAULT_PREGUNTAS_BOT } from '../lib/chatbotDefaults';

export function useChatbot(){
  const iniciar = useCatalogStore(s => s.iniciar);
  const chatbotSaludo = useCatalogStore(s => s.chatbotSaludo);
  const chatbotPreguntas = useCatalogStore(s => s.chatbotPreguntas);
  const chatbotListo = useCatalogStore(s => s.listoChatbot);
  useEffect(() => { iniciar(); }, [iniciar]);

  const listaPreguntasBot = useMemo(() => Object.entries(chatbotPreguntas).map(([id, p]) => ({ id, ...p })), [chatbotPreguntas]);
  const preguntasBotMostradas = listaPreguntasBot.length ? listaPreguntasBot : DEFAULT_PREGUNTAS_BOT;
  return { chatbotSaludo, chatbotPreguntas, chatbotListo, listaPreguntasBot, preguntasBotMostradas };
}
