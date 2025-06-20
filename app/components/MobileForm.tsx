"use client";
import React from "react";

export default function MobileForm({
  phone,
  setPhone,
  message,
  setMessage,
  selectedVoice,
  setSelectedVoice,
  handleSend,
}: any) {
  return (
    <section className="w-full max-w-sm px-0 pt-12 pb-8 bg-black text-white md:hidden flex flex-col text-left">
      {/* Título */}
      <div className="px-6">
        <h1 className="text-5xl font-extrabold mb-1 whitespace-nowrap text-white">BromaIA</h1>
        <h2 className="text-lg font-medium mb-6 whitespace-nowrap text-white">
          Bromas telefónicas generadas con IA.
        </h2>
      </div>

      {/* Teléfono */}
      <p className="text-sm mb-2 px-6 whitespace-nowrap text-white">
        Introduce ☎️ de la persona que quieras gastar la broma:
      </p>
      <div className="px-6 mb-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600000000"
          className="w-full bg-[#ff7fa1] text-white placeholder-white px-4 py-3 rounded-full text-center"
        />
      </div>

      {/* Voz */}
      <p className="text-sm mb-2 px-6 whitespace-nowrap text-white">Elige el tipo de voz:</p>
      <div className="px-6 mb-4">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full bg-[#ff7fa1] text-white px-4 py-3 rounded-full text-center appearance-none"
        >
          <option disabled value="">Selecciona una voz</option>
          <option value="voz1">Voz femenina</option>
          <option value="voz2">Voz masculina</option>
        </select>
      </div>

      {/* IA improvisa */}
      <p className="text-sm mb-2 px-6 whitespace-nowrap text-white">
        La IA improvisa el resto y le pone la voz:
      </p>

      {/* Textarea + flecha */}
      <div className="relative w-full px-6 mb-2">
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
          className="absolute right-9 top-1/2 transform -translate-y-1/2 bg-black rounded-full w-7 h-7 flex items-center justify-center"
        >
          <span className="text-white text-sm">➤</span>
        </button>
        <style jsx>{`
          textarea::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}
