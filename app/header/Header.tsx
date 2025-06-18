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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [menuOpen]);

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
    <header className="w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-10 bg-black">
      <div className="flex items-center gap-3">
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
      </div>

      <div className="flex items-center gap-4">
        {/* Texto con número de bromas */}
        <p className="text-white text-sm font-medium">
          {credits} broma{credits !== 1 && "s"}
        </p>

        {/* Botón para comprar bromas */}
        <button
          onClick={() => showSection("comprar-bromas")}
          className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors shadow-sm"
          title="Comprar bromas"
        >
          +
        </button>

        {/* Botón perfil con icono 👤 */}
        {userName && (
          <div className="relative" ref={profileRef}>
            <button
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-xl"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              👤
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow z-50 whitespace-nowrap text-sm">
                <button
                  onClick={() => {
                    showSection("historial");
                    setShowProfileMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Historial de bromas
                </button>
                <button
                  onClick={logoutFunction}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login/registro si no hay sesión */}
        {!userName && (
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
      </div>

      {/* Menú hamburguesa */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-14 left-6 z-[9999] bg-black border border-white rounded p-4 w-56 text-sm"
        >
          <ul className="flex flex-col gap-1">
            {[
              "¿Qué es BromaIA?",
              "¿Cómo funciona BromaIA?",
              "Ejemplos de bromas IA",
              "Comprar bromas",
              "Historial de bromas",
              "Preguntas frecuentes (FAQ)",
              "Términos y condiciones",
              "Política de privacidad",
              "Política de cookies",
              "Aviso legal",
              "Contacto",
            ].map((title, i) => (
              <li key={i}>
                <button
                  onClick={() =>
                    handleMenuClick(title.toLowerCase().replaceAll(" ", "-"))
                  }
                  className="text-left text-white hover:underline w-full"
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Registro */}
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
    </header>
  );
}
