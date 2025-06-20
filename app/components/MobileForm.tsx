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
    <section className="w-screen h-screen bg-black text-white fixed inset-0 flex items-center justify-center md:hidden overflow-hidden">
      <div className="w-full flex flex-col items-center justify-center px-4">
        <h1 className="text-[72px] font-extrabold leading-none mb-1">
          BromaIA
        </h1>

        <h2 className="text-sm font-normal leading-tight mb-4 text-center whitespace-nowrap">
          Bromas telefónicas generadas con IA.
        </h2>

        <p className="text-xs font-semibold mb-2 text-center">
          Introduce 📞 de la persona que quieras gastar la broma:
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600000000"
          className="w-full bg-rose-400 text-white placeholder-white px-4 py-2 rounded-full text-sm text-center mb-4"
        />

        <p className="text-xs font-semibold mb-2 text-center">Elige el tipo de voz:</p>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full bg-rose-400 text-white px-4 py-2 rounded-full text-sm text-center mb-4 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1rem",
          }}
        >
          <option disabled value="">
            Selecciona una voz
          </option>
          <option value="voz1">Voz femenina</option>
          <option value="voz2">Voz masculina</option>
        </select>

        <p className="text-xs font-semibold mb-2 text-center">
          La IA improvisa el resto y le pone la voz:
        </p>
        <div className="relative w-full mb-6" style={{ height: "80px" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="    Escribe tu broma."
            className="w-full h-full bg-rose-400 text-white placeholder-white px-4 pr-10 py-2 rounded-xl resize-none text-sm text-left leading-tight focus:outline-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
          >
            ›
          </button>
          <style jsx>{`
            textarea::-webkit-scrollbar {
              display: none;
            }
            textarea::placeholder {
              text-align: left;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
