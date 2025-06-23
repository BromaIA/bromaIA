'use client'
import { useState, useRef, useEffect } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '¡Hola! ¿Qué broma quieres que haga?' }
  ])
  const [input, setInput] = useState('')

  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll automático al último mensaje
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const newMessages = [...messages, { role: 'user', text: trimmed }]
    setMessages(newMessages)
    setInput('')

    const userMessages = newMessages.filter((msg) => msg.role === 'user')
    if (userMessages.length === 3) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Para hacer la broma gratis tienes que estar registrado.' }
        ])
      }, 800)
    }
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Zona scrollable solo para el chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] px-4 py-2 rounded-xl text-sm break-words whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-pink-400 text-white self-end ml-auto'
                : 'bg-white text-black self-start mr-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Cuadro fijo abajo */}
      <div className="w-full px-4 py-3 bg-black border-t border-white/10">
        <div className="relative w-full h-[45px]">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full h-full bg-pink-400 text-white px-4 pr-8 rounded-lg text-sm placeholder-white focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
