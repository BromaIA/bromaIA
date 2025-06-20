"use client";
import { useState } from "react";

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
  return (
    <section className="w-full h-screen bg-black text-white flex flex-col justify-start items-center pt-[16vh] px-2 overflow-hidden">
      <h1 className="text-[48px] font-extrabold leading-tight text-center whitespace-nowrap mb-1">
        BromaIA
      </h1>

      <h2 className="text-base font-medium text-center whitespace-nowrap mb-6">
        Bromas telefónicas generadas con IA.
      </h2>

      <div className="text-sm font-semibold text-center whitespace-nowrap mb-1">
        Introduce ☎️ de la persona que quieras gastar la broma:
      </div>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+34 600000000"
        className="w-full bg-[#d96ba1] text-white placeholder-white rounded-full px-4 py-3 mb-5 text-sm text-center focus:outline-none"
      />

      <div className="text-sm font-semibold text-center whitespace-nowrap mb-1">
        Elige el tipo de voz:
      </div>
      <select
        value={voiceOption}
        onChange={(e) => setVoiceOption(e.target.value)}
        className="w-full bg-[#d96ba1] text-white rounded-full px-4 py-3 mb-5 text-sm text-center focus:outline-none appearance-none"
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

      <div className="text-sm font-semibold text-center whitespace-nowrap mb-1">
        La IA improvisa el resto y le pone la voz:
      </div>

      <div className="relative w-full mb-4" style={{ height: "90px" }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu broma."
          className="w-full h-full bg-[#d96ba1] text-white placeholder-white px-4 pr-10 py-3 rounded-xl resize-none text-sm text-left leading-tight focus:outline-none overflow-hidden whitespace-nowrap"
        />
        <button
          onClick={handleSend}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
        >
          ›
        </button>
      </div>

      <div className="text-xs text-center mt-1 mb-2 whitespace-nowrap">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="form-checkbox accent-pink-400"
          />
          <span>Acepto los términos y la política de privacidad</span>
        </label>
      </div>

      {errorTerminos && (
        <div className="text-red-400 text-xs mt-1 text-center whitespace-nowrap">
          {errorTerminos}
        </div>
      )}
    </section>
  );
}
