"use client";

import { useState, useRef, useEffect } from "react";

interface MobileFormProps {
  phone: string;
  setPhone: (v: string) => void;
  voiceOption: string;
  setVoiceOption: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  handleSend: () => void;
  aceptaTerminos: boolean;
  setAceptaTerminos: (v: boolean) => void;
  errorTerminos: string;
  userName: string | null;
  started: boolean;
  setStarted: (v: boolean) => void;
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
  userName,
  started,
  setStarted,
}: MobileFormProps) {
  const [touched, setTouched] = useState(false);
  const [chat, setChat] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [initialMessages, setInitialMessages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const onSubmit = () => {
    setTouched(true);
    if (!aceptaTerminos) return;

    if (!started) {
      if (!phone || !voiceOption || !message) {
        setChat([
          { role: "ai", content: "⚠️ Rellena todos los campos antes de enviar la broma." },
        ]);
        return;
      }
      setInitialMessages([phone, voiceOption, message]);
      setStarted(true);
      setProcessing(true);
      setChat([
        { role: "user", content: `📱 Teléfono: ${phone}` },
        { role: "user", content: `🗣️ Voz: ${voiceOption}` },
        { role: "user", content: `💬 Mensaje: ${message}` },
        {
          role: "ai",
          content: `📞 Vas a enviar la broma al número ${phone} con la voz ${voiceOption} y el mensaje:\n\n"${message}".\n\nResponde "sí" para confirmar o "no" para cancelar.`,
        },
      ]);
      setMessage("");
    } else {
      const respuesta = message.trim().toLowerCase();
      setChat((prev) => [
        ...prev,
        { role: "user", content: message },
      ]);
      setMessage("");
      if (respuesta === "sí" || respuesta === "si") {
        setChat((prev) => [
          ...prev,
          { role: "ai", content: "⏳ Procesando la llamada..." },
        ]);
        // aquí podrías meter la llamada real si quisieras
        setTimeout(() => {
          setChat((prev) => [
            ...prev,
            {
              role: "ai",
              content: "✅ Broma enviada correctamente. La grabación aparecerá aquí al terminar.",
            },
          ]);
          setProcessing(false);
        }, 2000);
      } else if (respuesta === "no") {
        setChat((prev) => [
          ...prev,
          { role: "ai", content: "🚫 Broma cancelada. Puedes escribir otra si quieres." },
        ]);
        setProcessing(false);
      } else {
        setChat((prev) => [
          ...prev,
          { role: "ai", content: '⚠️ Responde con "sí" para confirmar o "no" para cancelar.' },
        ]);
      }
    }
  };

  useEffect(() => {
    if (started && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat, started]);

  if (!started) {
    return (
      <section className="w-full min-h-screen bg-black text-white flex flex-col justify-start items-center pt-[2vh] px-0 overflow-x-hidden">
        <h1 className="text-[42px] font-extrabold leading-tight text-center mb-1">
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

  // ✅ pantalla 2
  return (
    <section className="w-full min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <h1
        onClick={() => setStarted(false)}
        className="text-[32px] font-extrabold leading-tight text-center mb-1 cursor-pointer mt-2"
      >
        Broma<span className="text-white">IA</span>
      </h1>
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4"
        style={{ overscrollBehavior: "contain" }}
      >
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
              msg.role === "user"
                ? "bg-pink-400 text-white self-end ml-auto w-fit max-w-[90%]"
                : "bg-white text-black self-start mr-auto max-w-[75%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-black border-t border-pink-400">
        <div className="max-w-xl mx-auto relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Escribe tu respuesta..."
            className="w-full bg-pink-400 text-white placeholder-white rounded-xl px-4 py-3 text-xs focus:outline-none resize-none"
            style={{ height: "50px" }}
          />
          <button
            onClick={onSubmit}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
