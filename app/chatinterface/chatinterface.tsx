'use client'
import { useState } from 'react'

export const ChatInterface = () => {
const [messages, setMessages] = useState([
{ role: 'assistant', text: '¡Hola! ¿Qué broma quieres que haga?' }
])
const [input, setInput] = useState('')

const handleSend = () => {
if (!input.trim()) return
setMessages([...messages, { role: 'user', text: input }])
setTimeout(() => {
setMessages(prev => [...prev, { role: 'assistant', text: '¡Hecho! Llamando ahora mismo 📞' }])
}, 1000)
setInput('')
}

return (
<div className="h-screen w-screen bg-black text-white flex flex-col">
<div className="flex-1 overflow-y-auto p-4 space-y-3">
{messages.map((msg, i) => (
<div
key={i}
className={`max-w-[75%] p-3 rounded-lg ${
msg.role === 'user' ? 'bg-pink-400 self-end' : 'bg-gray-700 self-start'
}`}
>
{msg.text}
</div>
))}
</div>

<div className="p-4 flex gap-2">
<input
type="text"
placeholder="Escribe tu mensaje..."
className="flex-1 p-3 rounded-md bg-gray-800 text-white"
value={input}
onChange={(e) => setInput(e.target.value)}
/>
<button
onClick={handleSend}
className="bg-pink-500 px-4 rounded-md"
>
Enviar
</button>
</div>
</div>
)
}
