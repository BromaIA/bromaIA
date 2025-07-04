"use client";

import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../lib/firebase";

interface HeaderProps {
  reset: () => void;
  showSection: (section: string) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  otp: string;
  setOtp: (value: string) => void;
  confirmationResult: any;
  setConfirmationResult: (value: any) => void;
  smsError: string;
  setSmsError: (msg: string) => void;
  verificarCodigo: () => void;
  credits: number;
  setCredits: (n: number) => void;
}

export default function Header({
  reset,
  showSection,
  userName,
  setUserName,
  otp,
  setOtp,
  confirmationResult,
  setConfirmationResult,
  smsError,
  setSmsError,
  verificarCodigo,
  credits,
  setCredits,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Phone login local state (control dentro de Header)
  const [phoneLogin, setPhoneLogin] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const normalizarTelefono = (numero: string) => {
    const limpio = numero.replace(/\s+/g, "");
    if (limpio.startsWith("+34")) return limpio;
    if (limpio.startsWith("34")) return `+${limpio}`;
    if (limpio.startsWith("6") || limpio.startsWith("7")) return `+34${limpio}`;
    return limpio;
  };

  const iniciarSesion = async () => {
    const finalPhone = normalizarTelefono(phoneLogin);

    if (!finalPhone || finalPhone.length < 10) {
      setSmsError("Introduce un número válido.");
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
      }

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, finalPhone, appVerifier);
      if (!result) throw new Error("Error al obtener el código");

      setConfirmationResult(result);
      setSmsError("✅ Código enviado.");
    } catch (error: any) {
      const mensaje = error.message?.includes("auth/too-many-requests")
        ? "Demasiados intentos. Espera unos minutos."
        : "Error al enviar SMS.";
      setSmsError(`❌ ${mensaje}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
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
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get("success");
    if (success) {
      const cantidad = parseInt(success);
      if (!isNaN(cantidad)) {
        const nuevosCreditos = credits + cantidad;
        setCredits(nuevosCreditos);
        localStorage.setItem("bromaCredits", nuevosCreditos.toString());
        searchParams.delete("success");
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [credits, setCredits]);

  const handleMenuClick = (section: string) => {
    showSection(section);
    setMenuOpen(false);
  };

  const logoutFunction = () => {
    setUserName(null);
    setCredits(0);
    localStorage.removeItem("userName");
    localStorage.removeItem("bromaCredits");
    setShowProfileMenu(false);
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 bg-black shadow-lg">
      <div className="flex items-center gap-3 relative" ref={menuRef}>
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
          <div className="absolute top-full left-0 mt-2 z-50">
            <nav
              className="bg-black border border-white/20 rounded-lg p-4 w-64 text-sm shadow-lg animate-slide-down overflow-y-scroll pr-2 max-h-[70vh]"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
          </div>
        )}
      </div>

      {userName ? (
        <div className="flex items-center gap-4 text-sm">
          <div className="text-white">{credits} broma{credits !== 1 && "s"}</div>
          <button
            onClick={() => showSection("comprar-bromas")}
            className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center"
            title="Comprar bromas"
          >
            +
          </button>
          <div className="relative" ref={profileRef}>
            <button
              className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              👤
            </button>
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white text-black rounded-2xl shadow-lg z-50 p-4 space-y-3"
              >
                <p className="text-sm font-semibold text-gray-700">
                  Sesión iniciada: <span className="font-bold text-black">{userName}</span>
                </p>
                <button
                  onClick={() => {
                    showSection("historial");
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
                >
                  📜 Historial de bromas
                </button>
                <button
                  onClick={logoutFunction}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-sm text-red-600 transition"
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <button onClick={() => setShowRegister(true)} className="text-white hover:underline">
            Iniciar sesión
          </button>
          <button onClick={() => setShowRegister(true)} className="text-white hover:underline">
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
            value={phoneLogin}
            onChange={(e) => setPhoneLogin(e.target.value)}
            placeholder="+34 600000000"
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
              onClick={iniciarSesion}
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
