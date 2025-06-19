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
    <section className="w-full max-w-sm mx-auto px-4 py-8 text-center bg-black text-white md:hidden">
      <h1 className="text-5xl font-extrabold mb-1">BromaIA</h1>
      <h2 className="text-lg font-medium mb-6">Bromas telefónicas generadas con IA.</h2>

      <p className="text-white text-sm mb-2">
        Introduce 📞 de la persona que quieras gastar la broma:
      </p>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+34 600000000"
        className="w-full bg-rose-400 text-white placeholder-white px-4 py-3 rounded-full mb-4 text-center"
      />

      <p className="text-white text-sm mb-2">Elige el tipo de voz:</p>
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        className="w-full bg-rose-400 text-white px-4 py-3 rounded-full mb-4 text-center appearance-none"
      >
        <option disabled value="">Selecciona una voz</option>
        <option value="voz1">Voz femenina</option>
        <option value="voz2">Voz masculina</option>
      </select>

      <p className="text-white text-sm mb-2">
        La IA improvisa el resto y le pone la voz:
      </p>
      <div className="relative w-full">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu broma."
          className="w-full bg-rose-400 text-white placeholder-white px-4 py-3 pr-12 rounded-full mb-4 resize-none text-center"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black rounded-full w-6 h-6 flex items-center justify-center"
        >
          <span className="text-white text-xs">➤</span>
        </button>
      </div>
    </section>
  );
}
