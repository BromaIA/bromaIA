"use client";

import { useState, useEffect, useRef } from "react";

export default function MobileForm({
  phone,
  setPhone,
  voiceOption,
  setVoiceOption,
  message,
  setMessage,
  handleSend,
  aceptaTerminos,
  setAceptaTerminos,
  errorTerminos,
}: any) {
  const [touched, setTouched] = useState(false);
  const [started, setStarted] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ia"; content: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [initialMessages, setInitialMessages] = useState<string[]>([]);

  const onSubmit = () => {
    setTouched(true);
    if (!aceptaTerminos) return;
    if (!started) {
      setInitialMessages([phone, voiceOption, message]);
      setStarted(true);
      setMessage("");
      setTimeout(() => {
        window.scrollTo({ top: 0 });
        if (chatRef.current) chatRef.current.scrollTop = 0;
      }, 10);
    } else {
      setChat((prev) => [
        ...prev,
        { role: "user", content: message },
      ]);
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          { role: "ia", content: "🤖 Vale, buena broma. ¿Quieres otra?" },
        ]);
      }, 1000);
      setMessage("");
    }
  };

  useEffect(() => {
    if (
      Array.isArray(initialMessages) &&
      initialMessages.length === 3 &&
      chat.length === 0
    ) {
      const timer = setTimeout(() => {
        setChat([
          {
            role: "ia",
            content:
              "⚠️ Para hacer la broma gratis tienes que estar registrado. Inicia sesión arriba 👆",
          },
        ]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [initialMessages, chat]);

  if (!started) {
    return (
      <section
        ref={chatRef}
        className="w-full min-h-screen bg-black text-white flex flex-col justify-start items-center pt-[2vh] px-0"
      >
        <h1
          onClick={() => setStarted(false)}
          className="text-[52px] font-extrabold leading-tight text-center mb-1 cursor-pointer"
        >
          Broma<span className="text-white">IA</span>
        </h1>
        <h2 className="text-base font-medium text-center mb-6">
          Bromas telefónicas generadas con IA.
        </h2>

        <p className="text-sm font-semibold text-center mb-2">
          Introduce 📱 de la persona que quieras gastar la broma:
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600000000"
          className="w-[90%] bg-pink-400/90 text-white placeholder-white rounded-full px-4 py-3 mb-6 text-center focus:outline-none"
        />

        <p className="text-sm font-semibold text-center mb-2">Elige el tipo de voz:</p>
        <select
          value={voiceOption}
          onChange={(e) => setVoiceOption(e.target.value)}
          className="w-[80%] bg-pink-400/90 text-white rounded-full px-4 py-3 mb-6 text-center focus:outline-none appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="">Selecciona una voz</option>
          <option value="voz1">Femenina joven</option>
          <option value="voz2">Masculina seria</option>
        </select>

        <p className="text-sm font-semibold text-center mb-2">
          La IA improvisa el resto y le pone la voz:
        </p>
        <div className="relative w-[90%] mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu broma."
            className="w-full bg-pink-400 text-white placeholder-white rounded-2xl px-4 pr-10 py-3 text-left focus:outline-none resize-none"
            rows={2}
          />
          <button
            onClick={onSubmit}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
          >
            ›
          </button>
        </div>

        <div className="flex items-start text-white text-sm text-left w-[90%] mb-2">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={() => setAceptaTerminos(!aceptaTerminos)}
            className="mr-2 mt-1 w-4 h-4"
          />
          <label>
            Acepto los{" "}
            <a href="#terminos" className="underline hover:text-gray-300">
              términos y condiciones
            </a>{" "}
            y la{" "}
            <a href="#privacidad" className="underline hover:text-gray-300">
              política de privacidad
            </a>
          </label>
        </div>

        {touched && !aceptaTerminos && (
          <p className="text-red-400 text-sm mb-4">
            Debes aceptar los términos para continuar.
          </p>
        )}

        {errorTerminos && (
          <p className="text-red-400 text-sm mb-4">{errorTerminos}</p>
        )}
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-black text-white flex flex-col">
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4 scrollbar-negra"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {initialMessages.length === 3 && (
          <div className="flex flex-col space-y-3">
            <div className="bg-pink-400 text-white self-end ml-auto px-4 py-2 rounded-2xl max-w-[90%] text-sm break-words whitespace-pre-wrap">
              📱 Teléfono: {initialMessages[0]}
            </div>
            <div className="bg-pink-400 text-white self-end ml-auto px-4 py-2 rounded-2xl max-w-[90%] text-sm break-words whitespace-pre-wrap">
              🗣️ Voz: {initialMessages[1]}
            </div>
            <div className="bg-pink-400 text-white self-end ml-auto px-4 py-2 rounded-2xl max-w-[90%] text-sm break-words whitespace-pre-wrap">
              ✉️ Broma: {initialMessages[2]}
            </div>
          </div>
        )}

        {chat.map((msg, index) => (
          <div
            key={index}
            className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
              msg.role === "user"
                ? "bg-pink-400 text-white self-end ml-auto w-fit max-w-[90%]"
                : "bg-white text-black self-start mr-auto max-w-[75%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full px-4 pb-[env(safe-area-inset-bottom)] bg-black z-50">
        <div className="relative w-full py-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu broma..."
            rows={1}
            className="w-full bg-pink-400 text-white placeholder-white rounded-2xl px-4 pr-10 py-3 resize-none focus:outline-none"
          />
          <button
            onClick={onSubmit}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
