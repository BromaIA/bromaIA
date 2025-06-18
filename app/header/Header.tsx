"use client";

import { useState, useEffect, useRef } from "react";

export default function Header({
  reset,
  showSection,
  userName,
  setUserName,
  phone,
  setPhone,
  otp,
  setOtp,
  confirmationResult,
  setConfirmationResult,
  smsError,
  setSmsError,
  iniciarVerificacion,
  verificarCodigo,
  credits,
  setCredits,
}: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const registerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) {
        setShowRegister(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (section: string) => {
    showSection(section);
    setMenuOpen(false);
  };

  const logoutFunction = () => {
    setUserName(null);
    setCredits(0);
    localStorage.removeItem("userName");
    localStorage.removeItem("bromaCredits");
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-40 bg-black shadow-lg">
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => {
            reset();
            window.location.hash = "#pantalla1";
          }}
          className="text-white font-bold text-lg"
        >
          BromaIA
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl"
        >
          ☰
        </button>

        {menuOpen && (
          <nav
            ref={menuRef}
            className="absolute top-full left-0 mt-2 bg-black border border-white/20 rounded-lg p-4 w-64 text-sm z-50 shadow-lg animate-slide-down"
          >
            <ul className="flex flex-col gap-2 text-left">
              {[
                ["¿Qué es BromaIA?", "que-es-bromaia"],
                ["¿Cómo funciona BromaIA?", "como-funciona-bromaia"],
                ["Ejemplos de bromas IA", "ejemplos-de-bromaia"],
                ["Comprar bromas", "comprar-bromas"],
                ["Preguntas frecuentes (FAQ)", "faq"],
                ["Términos y condiciones", "terminos-y-condiciones"],
                ["Política de privacidad", "politica-de-privacidad"],
                ["Política de cookies", "politica-de-cookies"],
                ["Aviso legal", "aviso-legal"],
                ["Contacto", "contacto"],
              ].map(([label, slug], i) => (
                <li key={i}>
                  <button
                    onClick={() => handleMenuClick(slug)}
                    className="text-left text-white hover:underline w-full"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {userName ? (
        <div className="flex items-center gap-4 text-sm">
          <div className="text-white">
            {credits} broma{credits !== 1 && "s"}
          </div>
          <button
            onClick={() => showSection("comprar-bromas")}
            className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center"
          >
            ➕
          </button>
          <div className="relative" ref={profileRef}>
            <button
              className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              👤
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-black text-white rounded shadow z-50 text-xs">
                <button
                  onClick={() => {
                    showSection("historial");
                    setShowProfileMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Historial de bromas
                </button>
                <button
                  onClick={logoutFunction}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => alert("Aquí iría la lógica de inicio de sesión")}
            className="text-white hover:underline"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="text-white hover:underline"
          >
            Registrarse
          </button>
        </div>
      )}

      {showRegister && !userName && (
        <div
          ref={registerRef}
          className="absolute top-14 right-6 z-50 bg-black border border-white rounded p-4 w-[340px] text-sm text-white"
        >
          <p className="font-bold mb-3 text-center">Verifica tu número</p>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="600000000"
            className="w-full p-2 rounded mb-2 text-black"
          />
          {confirmationResult && (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Código SMS"
              className="w-full p-2 rounded mb-2 text-black"
            />
          )}
          {!confirmationResult ? (
            <button
              onClick={iniciarVerificacion}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded w-full"
            >
              Enviar código
            </button>
          ) : (
            <button
              onClick={verificarCodigo}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
            >
              Verificar
            </button>
          )}
          {smsError && <p className="mt-2 text-sm text-red-400">{smsError}</p>}
          <div id="recaptcha-container" />
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
