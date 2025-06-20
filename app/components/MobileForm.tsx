"use client";
import React from "react";

interface MobileFormProps {
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  selectedVoice: string;
  setSelectedVoice: (val: string) => void;
  handleSend: () => void;
  aceptaTerminos: boolean;
  setAceptaTerminos: (val: boolean) => void;
  errorTerminos: string;
}

export default function MobileForm({
  phone,
  setPhone,
  message,
  setMessage,
  selectedVoice,
  setSelectedVoice,
  handleSend,
  aceptaTerminos,
  setAceptaTerminos,
  errorTerminos,
}: MobileFormProps) {
  return (
    <section className="w-full h-screen bg-black text-white md:hidden flex flex-col justify-center items-center px-6 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-5xl font-extrabold mb-1">BromaIA</h1>
        <h2 className="text-lg font-medium mb-6">
          Bromas telefónicas generadas con IA.
        </h2>

        <p className="text-sm mb-2">Introduce ☎️ de la persona que quieras gastar la broma:</p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600000000"
          className="w-full bg-[#ff7fa1] text-white placeholder-white px-4 py-3 rounded-full mb-4 text-center"
        />

        <p className="text-sm mb-2">Elige el tipo de voz:</p>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full bg-[#ff7fa1] text-white px-4 py-3 rounded-full mb-4 text-center appearance-none"
        >
          <option disabled value="">Selecciona una voz</option>
          <option value="voz1">Voz femenina</option>
          <option value="voz2">Voz masculina</option>
        </select>

        <p className="text-sm mb-2">La IA improvisa el resto y le pone la voz:</p>

        <div className="relative w-full mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu broma."
            className="w-full bg-[#ff7fa1] text-white placeholder-white px-4 py-3 pr-10 rounded-full resize-none text-center overflow-hidden whitespace-nowrap"
            rows={1}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black rounded-full w-7 h-7 flex items-center justify-center"
          >
            <span className="text-white text-sm">➤</span>
          </button>
          <style jsx>{`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2 text-xs text-white">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="form-checkbox h-4 w-4 text-black bg-white rounded border-white"
          />
          <label className="text-left">
            Acepto los{" "}
            <a href="/terminos" className="underline" target="_blank">
              términos
            </a>{" "}
            y la{" "}
            <a href="/privacidad" className="underline" target="_blank">
              política de privacidad
            </a>
            .
          </label>
        </div>

        {errorTerminos && (
          <p className="text-red-400 text-xs mb-1">{errorTerminos}</p>
        )}
      </div>
    </section>
  );
}
