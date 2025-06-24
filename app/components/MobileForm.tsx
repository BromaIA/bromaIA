"use client";

export default function MobileForm({
  phone,
  setPhone,
  voiceOption,
  setVoiceOption,
  message,
  setMessage,
}: any) {
  return (
    <section className="w-full h-screen bg-black text-white flex flex-col justify-start items-center pt-[2vh] px-0 overflow-hidden">
      {/* Índice */}
      <h1 className="text-[52px] font-extrabold leading-tight text-center mb-1">
        Broma<span className="text-white">IA</span>
      </h1>
      <h2 className="text-base font-medium text-center mb-6">
        Bromas telefónicas generadas con IA.
      </h2>

      {/* Teléfono */}
      <p className="text-sm font-semibold text-center mb-2">
        Introduce 📞 de la persona que quieras gastar la broma:
      </p>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+34 600000000"
        className="w-[90%] bg-pink-300 text-white placeholder-white rounded-full px-4 py-3 mb-6 text-center focus:outline-none"
      />

      {/* Voz */}
      <p className="text-sm font-semibold text-center mb-2">
        Elige el tipo de voz:
      </p>
      <select
        value={voiceOption}
        onChange={(e) => setVoiceOption(e.target.value)}
        className="w-[80%] bg-pink-300 text-white rounded-full px-4 py-3 mb-6 text-center focus:outline-none appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1rem',
        }}
      >
        <option value="">Selecciona una voz</option>
        <option value="voz1">Femenina joven</option>
        <option value="voz2">Masculina seria</option>
      </select>

      {/* Texto broma */}
      <p className="text-sm font-semibold text-center mb-2">
        La IA improvisa el resto y le pone la voz:
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe tu broma."
        className="w-[90%] bg-pink-300 text-white placeholder-white rounded-2xl px-4 py-3 text-left focus:outline-none resize-none"
        rows={2}
      />
    </section>
  );
}
