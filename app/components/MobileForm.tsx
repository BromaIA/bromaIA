"use client";
import React, { useRef, useEffect } from "react";

interface MobileFormProps {
  phone: string;
  setPhone: (value: string) => void;
  voiceOption: string;
  setVoiceOption: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  handleSend: () => void;
  aceptaTerminos: boolean;
  setAceptaTerminos: (value: boolean) => void;
  errorTerminos: string;
  userName: string | null;
  started: boolean;
  setStarted: (value: boolean) => void;
  chat: { role: "user" | "ai"; content: string | React.ReactNode }[];
  initialMessages: string[];
  processing: boolean;
  handleConfirmation: (texto: string) => void;
}

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
  started,
  setStarted,
  chat,
  initialMessages,
  processing,
  handleConfirmation,
}: MobileFormProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <>
      {/* Pantalla 1 en móvil */}
      {!started && (
        <section className="w-full flex flex-col items-center justify-start px-4 pt-20 pb-20 bg-black text-white">
          <h1 className="text-4xl font-extrabold mb-1">BromaIA</h1>
          <h2 className="text-base font-medium mb-6">
            Bromas telefónicas generadas con IA
          </h2>

          <div className="text-sm w-full mb-2 text-left whitespace-nowrap">
            Introduce 📞 de la persona que quieras gastar la broma:
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34 600000000"
            className="w-full bg-pink-400 text-white placeholder-white rounded-full px-4 py-3 mb-4 text-sm text-center focus:outline-none"
          />

          <div className="text-sm w-full mb-2 text-left whitespace-nowrap">
            Elige el tipo de voz:
          </div>
          <select
            value={voiceOption}
            onChange={(e) => setVoiceOption(e.target.value)}
            className="w-full bg-pink-400 text-white rounded-full px-4 py-3 mb-4 text-sm text-center focus:outline-none appearance-none"
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

          <div className="text-sm w-full mb-2 text-left whitespace-nowrap">
            La IA improvisa el resto y le pone la voz:
          </div>

          <div className="relative w-full mb-4" style={{ height: "90px" }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="  Escribe tu broma."
              className="w-full h-full bg-pink-400 text-white placeholder-white px-4 pr-10 py-3 rounded-xl resize-none text-sm text-left leading-tight focus:outline-none"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            />
            <button
              onClick={() => {
                if (!aceptaTerminos) {
                  alert("Debes aceptar los términos");
                  return;
                }
                handleSend();
                setStarted(true);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
            >
              ›
            </button>
            <style jsx>{`
              textarea::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>

          <div className="flex items-start mb-4 text-white text-sm w-full">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={() => setAceptaTerminos(!aceptaTerminos)}
              className="mr-2 mt-1 w-4 h-4"
            />
            <label>
              Acepto los{" "}
              <a
                href="#terminos"
                className="underline text-white hover:text-gray-300"
              >
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a
                href="#privacidad"
                className="underline text-white hover:text-gray-300"
              >
                política de privacidad
              </a>
            </label>
          </div>
          {errorTerminos && (
            <p className="text-red-400 text-sm mb-4">{errorTerminos}</p>
          )}
        </section>
      )}

      {/* Pantalla 2 en móvil */}
      {started && initialMessages.length === 3 && (
        <section className="w-full flex flex-col items-center justify-start px-4 pt-4 pb-28 bg-black text-white overflow-y-auto">
          <div className="w-full max-w-xl space-y-4">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-pink-400 text-white"
                    : "bg-white text-black"
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="fixed bottom-0 left-0 right-0 py-3 px-4 border-t border-black bg-black">
            <div className="max-w-xl mx-auto relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (processing) {
                      handleConfirmation(message);
                    } else {
                      handleSend();
                    }
                  }
                }}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-pink-400 text-white rounded-xl px-4 py-3 text-xs focus:outline-none resize-none"
                style={{ height: "50px" }}
              />
              <button
                onClick={() => {
                  if (processing) {
                    handleConfirmation(message);
                  } else {
                    handleSend();
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
