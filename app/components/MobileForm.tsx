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
    <section className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-start px-4 pt-[16vh]">
      {/* Título */}
      <h1 className="text-[52px] font-extrabold text-white text-center leading-none mb-1">
        BromaIA
      </h1>
      <h2 className="text-base font-medium text-white text-center mb-10">
        Bromas telefónicas generadas con IA.
      </h2>

      {/* Teléfono */}
      <label className="text-sm font-semibold text-white mb-2 text-center w-full">
        Introduce 📞 de la persona que quieras gastar la broma:
      </label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+34 600000000"
        className="w-full bg-pink-500 text-white placeholder-white rounded-full px-6 py-3 mb-6 text-center text-base focus:outline-none"
      />

      {/* Tipo de voz */}
      <label className="text-sm font-semibold text-white mb-2 text-center w-full">
        Elige el tipo de voz:
      </label>
      <select
        value={voiceOption}
        onChange={(e) => setVoiceOption(e.target.value)}
        className="w-full bg-pink-500 text-white rounded-full px-6 py-3 mb-6 text-center text-base focus:outline-none appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg fill='white' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1rem",
        }}
      >
        <option value="">Selecciona una voz</option>
        <option value="voz1">Femenina joven</option>
        <option value="voz2">Masculina seria</option>
      </select>

      {/* Mensaje */}
      <label className="text-sm font-semibold text-white mb-2 text-center w-full">
        La IA improvisa el resto y le pone la voz:
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe tu broma."
        className="w-full bg-pink-500 text-white placeholder-white px-4 py-3 mb-6 rounded-2xl text-sm resize-none text-left focus:outline-none"
        rows={3}
      />

      {/* Términos */}
      <div className="flex items-start mb-4 text-white text-sm w-full">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={() => setAceptaTerminos(!aceptaTerminos)}
          className="mr-2 mt-1 w-4 h-4"
        />
        <label>
          Acepto los{" "}
          <a href="#terminos" className="underline text-white hover:text-gray-300">
            términos y condiciones
          </a>{" "}
          y la{" "}
          <a href="#privacidad" className="underline text-white hover:text-gray-300">
            política de privacidad
          </a>
        </label>
      </div>
      {errorTerminos && (
        <p className="text-red-400 text-sm mb-4">{errorTerminos}</p>
      )}

      {/* Botón enviar */}
      <button
        onClick={handleSend}
        className="bg-white text-black font-semibold px-6 py-3 rounded-full mt-2 text-sm transition hover:bg-gray-200"
      >
        Empezar broma
      </button>
    </section>
  );
}
