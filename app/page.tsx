"use client";
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Header from "./header/Header";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [visibleSection, setVisibleSection] = useState<string | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [smsError, setSmsError] = useState("");
  const [bromasDisponibles, setBromasDisponibles] = useState<number>(0);

  const actualizarBromas = (nuevaCantidad: number) => {
    setBromasDisponibles(nuevaCantidad);
    localStorage.setItem("bromasDisponibles", nuevaCantidad.toString());
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [formSent, setFormSent] = useState(false);

  const reset = () => {
    setStarted(false);
    setChat([]);
    setMessage("");
    setProcessing(false);
    setInitialMessage(null);
    setVisibleSection(null);
  };

  const showSection = (section: string) => {
    setVisibleSection(section);
  };

  useEffect(() => {
    const storedCredits = localStorage.getItem("bromaCredits");
    if (storedCredits) {
      setCredits(parseInt(storedCredits));
    } else {
      localStorage.setItem("bromaCredits", "1");
      setCredits(1);
    }
  }, []);

  useEffect(() => {
    const cantidadGuardada = localStorage.getItem("bromasDisponibles");
    if (cantidadGuardada) {
      setBromasDisponibles(parseInt(cantidadGuardada, 10));
    }
  }, []);

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("userName");
    if (nombreGuardado) {
      setUserName(nombreGuardado);
    }
  }, []);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (!aceptaTerminos) {
      setErrorTerminos("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    setErrorTerminos("");
    setMessage("");

    if (!started) {
      setInitialMessage(trimmedMessage);
      setChat([trimmedMessage]);
      setStarted(true);
      setProcessing(true);

      if (!userName) {
        setTimeout(() => {
          setChat((prev) => [
            ...prev,
            "🎁 Regístrate gratis y obtén 1 broma para empezar.",
          ]);
          setProcessing(false);
        }, 1200);
        return;
      }

      if (credits > 0) {
        const nuevoCredito = credits - 1;
        setCredits(nuevoCredito);
        localStorage.setItem("bromaCredits", nuevoCredito.toString());

        setTimeout(() => {
          setChat((prev) => [...prev, `Respuesta IA simulada a: ${trimmedMessage}`]);
          setProcessing(false);
        }, 1200);
      } else {
        setTimeout(() => {
          setChat((prev) => [
            ...prev,
            "⚠️ Ya has usado tus bromas gratuitas. Compra más para seguir usando BromaIA.",
          ]);
          setProcessing(false);
        }, 1200);
      }

      return;
    }

    setChat((prev) => [...prev, trimmedMessage]);
    setProcessing(true);

    if (!userName) {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          "⚠️ Solo puedes obtener una broma gratuita registrándote. Después, puedes conseguir otra subiendo un TikTok con tu broma y mencionando a @bromaIA.",
        ]);
        setProcessing(false);
      }, 1200);
      return;
    }

    if (credits > 0) {
      const nuevoCredito = credits - 1;
      setCredits(nuevoCredito);
      localStorage.setItem("bromaCredits", nuevoCredito.toString());

      setTimeout(() => {
        setChat((prev) => [...prev, `Respuesta IA simulada a: ${trimmedMessage}`]);
        setProcessing(false);
      }, 1200);
    } else {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          "⚠️ Ya has usado tus bromas gratuitas. Compra más para seguir usando BromaIA.",
        ]);
        setProcessing(false);
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const iniciarVerificacion = async () => {
    const cleanedPhone = phone.replace(/\s+/g, "");
    const finalPhone = cleanedPhone.startsWith("+34")
      ? cleanedPhone
      : `+34${cleanedPhone.startsWith("34") ? cleanedPhone.slice(2) : cleanedPhone}`;

    if (!finalPhone || finalPhone.length < 10) {
      setSmsError("Introduce un número de teléfono válido.");
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

      if (!result) throw new Error("No se recibió confirmationResult");

      setConfirmationResult(result);
      setSmsError("✅ Código enviado. Revisa tu SMS.");
    } catch (error: any) {
      console.error("Error al enviar SMS:", error);
      const mensaje = error.message?.includes("auth/too-many-requests")
        ? "Demasiados intentos. Espera unos minutos."
        : "No se pudo enviar el SMS. Inténtalo más tarde.";
      setSmsError(`❌ ${mensaje}`);
    }
  };

  const verificarCodigo = async () => {
    if (!confirmationResult) {
      setSmsError("Primero debes solicitar el código.");
      return;
    }

    if (!otp || otp.length < 4) {
      setSmsError("Introduce un código válido.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const phoneNumber = result?.user?.phoneNumber || "Usuario";

      setUserName(phoneNumber);
      localStorage.setItem("userName", phoneNumber);
      setSmsError("✅ Número verificado correctamente.");
    } catch (error: any) {
      console.error("Error al verificar código:", error);
      const mensaje =
        error.message?.includes("auth/invalid-verification-code") ||
        error.message?.includes("code") ||
        error.message?.includes("invalid")
          ? "Código incorrecto o expirado."
          : "Error inesperado al verificar. Inténtalo más tarde.";
      setSmsError(`❌ ${mensaje}`);
    }
  };

  return (
    <>
      <div id="recaptcha-container" />
      <Header
        reset={reset}
        showSection={showSection}
        userName={userName}
        setUserName={setUserName}
        phone={phone}
        setPhone={setPhone}
        otp={otp}
        setOtp={setOtp}
        confirmationResult={confirmationResult}
        setConfirmationResult={setConfirmationResult}
        smsError={smsError}
        setSmsError={setSmsError}
        iniciarVerificacion={iniciarVerificacion}
        verificarCodigo={verificarCodigo}
        credits={credits}
        setCredits={setCredits}
      />

<div id="recaptcha-container" />


    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 pl-20 relative">

      {/* Pantalla 1 */}
      {!started && !visibleSection && (
        <section id="pantalla1" className="w-full max-w-xl text-center">
          <h1 className="text-5xl font-bold mb-0">Tu voz da risa.</h1>
          <h2 className="text-5xl font-bold mb-2">La nuestra, llamadas.</h2>

          <div className="flex flex-col items-start text-left mx-auto" style={{ width: "561px" }}>
            <p className="text-sm whitespace-nowrap mb-3">
              Bromas telefónicas personalizables con IA y grabación al instante.
            </p>

            <div className="relative w-full mb-3 h-[45px]">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Empieza a generar tu broma..."
                className="w-full h-full bg-rose-400 text-white placeholder-white px-3 pr-8 pt-[11px] pb-0 rounded resize-none overflow-y-auto text-xs focus:outline-none text-left leading-tight"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  lineHeight: "1.4",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              />
              <style jsx>{`
                textarea::-webkit-scrollbar {
                  display: none;
                }
                textarea::placeholder {
                  vertical-align: middle;
                }
              `}</style>
              <button
                onClick={handleSend}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none"
              >
                ›
              </button>
            </div>

            <div className="text-xs w-full mb-2">
              <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={() => setAceptaTerminos(!aceptaTerminos)}
                  className="cursor-pointer"
                />
                Acepto los{" "}
                <a href="#terminos-y-condiciones" className="underline" onClick={() => setVisibleSection("terminos-y-condiciones")}>
                  términos
                </a>{" "}
                y{" "}
                <a href="#politica-de-privacidad" className="underline" onClick={() => setVisibleSection("politica-de-privacidad")}>
                  política de privacidad
                </a>.
              </label>
            </div>
            {errorTerminos && (
              <p className="text-red-500 text-xs mt-2 text-center">{errorTerminos}</p>
            )}
          </div>
        </section>
      )}

      {/* Pantalla 2 */}
      {started && !visibleSection && (
        <section className="w-full max-w-xl text-center h-screen flex flex-col justify-between">
          <div
            className="flex-grow overflow-y-auto px-2 pt-6 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex flex-col items-center gap-3">
              {initialMessage && (
                <div
                  className="inline-block px-4 py-2 rounded-lg text-sm max-w-[75%] bg-rose-400 text-white self-end"
                  key="initial-message"
                >
                  {initialMessage}
                </div>
              )}

              {chat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-[75%] ${
                    idx % 2 === 0
                      ? "bg-rose-400 text-white self-end"
                      : "bg-white text-black self-start"
                  }`}
                >
                  {msg}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="w-[561px] mx-auto mb-6">
            {processing && (
              <div className="text-pink-300 font-medium text-sm text-left mb-1">
                Procesando...
              </div>
            )}
            <div className="relative w-full h-[45px]">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="w-full h-full bg-rose-400 text-white placeholder-white px-3 pr-8 pt-[11px] pb-0 rounded resize-none overflow-y-auto text-xs focus:outline-none text-left leading-tight"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              />
              <style jsx>{`
                textarea::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <button
                onClick={handleSend}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      )}

        {/* Secciones del menú */}
        {visibleSection === "que-es-bromaia" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">1. ¿Qué es BromaIA?</h3>
            <div className="text-left">
              <p className="mb-4">
                BromaIA es una plataforma pionera que utiliza inteligencia artificial para ofrecerte una experiencia única y divertida: crear bromas telefónicas personalizadas y realistas en tiempo real. Con nuestra tecnología avanzada de síntesis de voz, puedes diseñar llamadas con voces naturales, capaces de interactuar contigo o con tus amigos, y además grabar estas conversaciones al instante para conservar esos momentos de humor.
              </p>
              <p className="mb-4">
                Esta herramienta ha sido diseñada para que cualquier persona pueda usarla sin complicaciones técnicas, proporcionando un entorno seguro y controlado para evitar bromas ofensivas o inapropiadas. Gracias a BromaIA, podrás sorprender a tus amigos con bromas originales y totalmente adaptadas a la ocasión, sin necesidad de equipos profesionales ni habilidades técnicas.
              </p>
              <p className="mb-4">
                Además, BromaIA integra sistemas de protección y filtros para garantizar que las bromas se realicen dentro de un marco ético y legal, evitando situaciones que puedan perjudicar a terceros. Nuestra plataforma abre un mundo nuevo de posibilidades para el entretenimiento digital, combinando la creatividad humana con la potencia de la inteligencia artificial.
              </p>
            </div>
          </section>
        )}

        {visibleSection === "como-funciona-bromaia" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">2. ¿Cómo funciona BromaIA?</h3>
            <div className="text-left">
              <p className="mb-4">
                En BromaIA, tú eres el creador de la idea. Solo tienes que escribir el mensaje o la broma que quieres realizar, describiendo de forma sencilla y detallada lo que quieres que diga nuestro asistente.
              </p>
              <p className="mb-4">
                A partir de tu texto, nuestro sistema inteligente interpreta la idea y la transforma en una llamada con voz natural, adaptando el contenido para que suene auténtico y fluido. La llamada se genera en tiempo real y se puede grabar al instante, para que puedas escucharla, compartirla o usarla cuando quieras.
              </p>
              <p className="mb-4">
                Todo este proceso es rápido, intuitivo y no requiere ningún conocimiento técnico. Solo tú pones la creatividad, y BromaIA se encarga del resto para que la broma suene lo más natural y divertida posible.
              </p>
            </div>
          </section>
        )}

        {visibleSection === "ejemplos-de-bromaia" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">3. Ejemplos de Bromas IA</h3>
            <div className="text-left">
              <p className="mb-4">
                En BromaIA, la creatividad no tiene límites. Puedes crear bromas para cualquier ocasión: desde llamadas divertidas con situaciones absurdas hasta mensajes ingeniosos que sorprendan a tus amigos.
              </p>
              <p className="mb-4">
                Algunos ejemplos populares incluyen bromas relacionadas con compras extrañas, mensajes de "incidencias" inesperadas, situaciones cotidianas que se tuercen, o personajes ficticios que llaman con información disparatada. Todo siempre con un toque de humor, asegurando risas sin dañar a nadie.
              </p>
              <p className="mb-4">
                Nuestra plataforma te permite personalizar cada detalle para que la broma sea única y memorable. ¿Quieres una llamada sarcástica, irónica o simplemente absurda? ¡BromaIA lo hace posible!
              </p>
            </div>
          </section>
        )}

        {visibleSection === "politica-de-privacidad" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
              section p {
                margin-bottom: 1.5rem;
              }
            `}</style>
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Política de privacidad</h3>

            <div className="text-left">
              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">1. Responsable del tratamiento</h4>
                <p>
                  El responsable del tratamiento de los datos personales en esta plataforma es BromaIA. Puedes contactar con nosotros a través del formulario de contacto disponible en la web. Nos comprometemos a tratar tus datos de forma segura y conforme a lo establecido por el Reglamento General de Protección de Datos (RGPD) y la LOPDGDD.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">2. Datos que recopilamos</h4>
                <p>
                  Recopilamos datos mínimos y necesarios para ofrecer nuestros servicios: correo electrónico, grabaciones de voz generadas, dirección IP, preferencias básicas (como aceptación de cookies o términos) y, en su caso, información de pago gestionada por Stripe. No solicitamos más datos de los estrictamente necesarios.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">3. Finalidad del tratamiento</h4>
                <p>
                  Utilizamos los datos para: prestar el servicio de bromas telefónicas personalizadas con inteligencia artificial, enviar grabaciones de voz, gestionar el registro de usuarios y procesar pagos de forma segura. No se realizarán decisiones automatizadas con efectos legales sin el consentimiento del usuario.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">4. Conservación de los datos</h4>
                <p>
                  Conservaremos tus datos únicamente durante el tiempo necesario para prestar el servicio o cumplir con obligaciones legales. Las grabaciones generadas podrán ser eliminadas automáticamente tras un periodo breve, salvo que el usuario las descargue o solicite su eliminación inmediata.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">5. Derechos del usuario</h4>
                <p>
                  Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación del tratamiento y portabilidad escribiéndonos desde la sección de contacto. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos si consideras que se ha vulnerado alguno de tus derechos.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">6. Comunicación de datos a terceros</h4>
                <p>
                  No compartimos tus datos con terceros, salvo que sea estrictamente necesario para prestar el servicio (por ejemplo, la pasarela de pago Stripe o la plataforma de voz Retell AI). Estas entidades actúan como encargados del tratamiento y cumplen con todas las medidas legales de seguridad.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">7. Seguridad de la información</h4>
                <p>
                  Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos. Nuestra plataforma utiliza cifrado, autenticación segura y controles de acceso. Sin embargo, te recordamos que ningún sistema es 100 % infalible, por lo que también es importante que protejas tus credenciales de acceso.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">8. Cookies y preferencias</h4>
                <p>
                  Solo utilizamos cookies técnicas esenciales para el funcionamiento del sitio: recordar si has aceptado términos, si estás registrado y si has iniciado sesión. No usamos cookies de terceros ni fines publicitarios. Puedes cambiar tus preferencias desde la sección "Política de cookies".
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">9. Medios de pago y privacidad</h4>
                <p>
                  Todos los pagos se procesan mediante Stripe. No almacenamos información bancaria en nuestros servidores. Stripe cumple con los estándares de seguridad PCI DSS. Tu transacción se realiza de forma cifrada y segura en todo momento.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">10. Edad mínima de uso</h4>
                <p>
                  El uso de esta plataforma está limitado a personas mayores de 18 años. Si detectamos el uso por parte de un menor, podremos bloquear el acceso y eliminar los datos asociados. Al registrarte, declaras ser mayor de edad y aceptar estas condiciones.
                </p>
              </section>
            </div>
          </section>
        )}

        {visibleSection === "terminos-y-condiciones" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
              section p {
                margin-bottom: 1.5rem;
              }
              section h4 {
                margin-bottom: 0.5rem;
              }
            `}</style>

            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Términos y condiciones</h3>

            <div className="text-left">
              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">1. Objeto</h4>
                <p>
                  El presente documento regula el acceso, navegación y uso de la plataforma BromaIA, que permite a los usuarios crear y ejecutar bromas telefónicas mediante inteligencia artificial. Al utilizar la plataforma, aceptas íntegramente estos términos, así como la legislación vigente aplicable en España y la Unión Europea.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">2. Uso del servicio</h4>
                <p>
                  BromaIA facilita llamadas automatizadas con voces sintéticas. El usuario es el único responsable del contenido creado y de su uso. Queda prohibido utilizar el servicio para fines ilícitos, ofensivos, intimidatorios, discriminatorios o contrarios a los derechos de terceros, la moral o el orden público.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">3. Registro y acceso</h4>
                <p>
                  Algunas funciones requieren registro con datos reales y actualizados. El usuario se compromete a mantener la confidencialidad de sus credenciales y a no cederlas a terceros. Cualquier actividad desde su cuenta será considerada bajo su responsabilidad exclusiva.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">4. Propiedad intelectual</h4>
                <p>
                  Todos los contenidos, interfaces, diseños, audios, logotipos, textos y software de BromaIA están protegidos por derechos de propiedad intelectual. El uso del servicio no otorga ningún derecho de propiedad sobre los elementos mencionados, salvo los necesarios para su utilización legítima y personal.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">5. Grabaciones y privacidad</h4>
                <p>
                  Las llamadas se graban automáticamente. El usuario acepta su almacenamiento temporal con fines de calidad, revisión o seguridad. El tratamiento de estos datos se rige por la Política de Privacidad y el Reglamento General de Protección de Datos (RGPD).
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">6. Limitación de responsabilidad</h4>
                <p>
                  BromaIA no se hace responsable de los efectos derivados del uso del servicio por parte de los usuarios. Tampoco garantiza disponibilidad ininterrumpida ni ausencia de errores. El uso del servicio se realiza bajo responsabilidad del usuario, sin perjuicio de los derechos reconocidos por la ley.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">7. Conducta prohibida</h4>
                <p>
                  Se prohíbe utilizar la plataforma para: acosar, difamar, suplantar identidades, lanzar mensajes ofensivos o manipuladores, simular ser una institución real o alterar la integridad técnica del sistema. El incumplimiento puede implicar la cancelación inmediata de la cuenta y la notificación a las autoridades.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">8. Modificaciones</h4>
                <p>
                  BromaIA podrá actualizar estos Términos y Condiciones en cualquier momento. Se informará a los usuarios por medios visibles en la web. El uso continuado tras la publicación de los cambios implica la aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">9. Duración y terminación</h4>
                <p>
                  El servicio estará disponible mientras BromaIA lo determine. El usuario podrá cancelar su cuenta en cualquier momento. BromaIA también podrá bloquear cuentas que incumplan estos términos o afecten negativamente a la plataforma o a otros usuarios.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">10. Legislación aplicable y jurisdicción</h4>
                <p>
                  Este acuerdo se rige por la legislación española. Para cualquier conflicto que pudiera derivarse, las partes se someten a los Juzgados y Tribunales del domicilio del usuario, conforme a la normativa de protección de consumidores y usuarios.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">11. Consentimiento y veracidad</h4>
                <p>
                  Al utilizar la plataforma, el usuario declara tener al menos 18 años y aceptar estos términos de forma voluntaria. Asimismo, garantiza que las bromas realizadas cumplen con la normativa vigente y asume la responsabilidad por las consecuencias legales de su contenido.
                </p>
              </section>
            </div>
          </section>
        )}

        {visibleSection === "aviso-legal" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
              section p {
                margin-bottom: 1.5rem;
              }
              section h4 {
                margin-bottom: 0.5rem;
              }
            `}</style>

            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Aviso Legal</h3>

            <div className="text-left">
              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">1. Identificación del titular</h4>
                <p>
                  En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa que el presente sitio web y plataforma, BromaIA, es gestionado por un particular. Para cualquier consulta o contacto, puedes escribirnos al correo electrónico: contacto@bromaia.com.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">2. Objeto del sitio web</h4>
                <p>
                  BromaIA ofrece un servicio online de bromas telefónicas personalizadas mediante inteligencia artificial. El contenido está destinado exclusivamente a fines recreativos, y su uso implica la aceptación de las condiciones legales publicadas en este sitio.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">3. Condiciones de uso</h4>
                <p>
                  El acceso y uso de esta plataforma atribuye la condición de usuario y conlleva la aceptación plena y sin reservas de las disposiciones aquí recogidas. Se prohíbe cualquier uso contrario a la ley, la moral o el orden público. El usuario se compromete a hacer un uso adecuado del contenido y servicios ofrecidos.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">4. Propiedad intelectual e industrial</h4>
                <p>
                  Todos los elementos del sitio web (textos, imágenes, diseño, código, logotipos, audios generados, etc.) son propiedad de BromaIA o cuentan con licencia de uso. Queda prohibida su reproducción total o parcial sin autorización expresa, salvo en los casos legalmente permitidos.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">5. Responsabilidad</h4>
                <p>
                  BromaIA no se hace responsable de los usos indebidos del servicio por parte de los usuarios. El usuario es el único responsable de las bromas realizadas y del contenido introducido. Asimismo, BromaIA no garantiza la disponibilidad continua del servicio, pudiendo suspenderse por mantenimiento, mejoras o causas ajenas.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">6. Protección de datos</h4>
                <p>
                  Los datos personales recopilados serán tratados conforme a la normativa vigente en materia de protección de datos (RGPD y LOPDGDD), tal y como se detalla en nuestra Política de Privacidad. El usuario podrá ejercer sus derechos legales en cualquier momento.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">7. Uso responsable del contenido</h4>
                <p>
                  Las bromas generadas mediante la IA de BromaIA están diseñadas para el entretenimiento. Está prohibido utilizar la plataforma para acosar, suplantar identidades reales, difamar o causar daño psicológico. El incumplimiento de esta norma puede conllevar el bloqueo del usuario y la cancelación del servicio.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">8. Legislación y jurisdicción aplicable</h4>
                <p>
                  El presente Aviso Legal se rige por la legislación española. Para cualquier conflicto o controversia, las partes se someterán a los Juzgados y Tribunales que resulten competentes conforme a la normativa vigente sobre consumidores y usuarios.
                </p>
              </section>
            </div>
          </section>
        )}
        
{visibleSection === "historial" && (
  <div
    className="fixed top-[5rem] left-0 right-0 bottom-0 overflow-y-auto bg-black text-white px-4 pb-6"
    style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
  >
    <style jsx>{`
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>

    <h3 className="text-2xl font-bold mb-6 text-center">Historial de bromas</h3>
    {(() => {
      const historial = JSON.parse(localStorage.getItem("historialBromas") || "[]").reverse();

      if (historial.length === 0) {
        return (
          <p className="mb-4 text-center text-sm text-white/70">
            No has realizado ninguna broma todavía.
          </p>
        );
      }

      return (
        <ul className="space-y-6 max-w-xl mx-auto">
          {historial.slice(0, 5).map((broma: any, index: number) => {
            const fecha = new Date(broma.fecha).toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li
                key={index}
                className="border border-white/30 rounded-lg p-4 bg-white/5 backdrop-blur-sm"
              >
                <p className="text-sm mb-2 text-pink-300 font-semibold">📅 {fecha}</p>
                <p className="text-white mb-2 text-sm italic">“{broma.texto}”</p>

                <audio controls className="w-full rounded-md bg-white text-black mb-3">
                  <source src={broma.audioUrl} type="audio/mpeg" />
                </audio>

                <div className="flex items-center gap-6 text-sm mt-2">
                  <a
                    href={`https://wa.me/?text=🎧%20Escucha%20mi%20broma%20de%20BromaIA:%20${encodeURIComponent(
                      broma.audioUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#25D366"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path d="M12.04 2C6.56 2 2.09 6.47 2.09 11.94c0 2.11.62 4.1 1.79 5.81L2 22l4.38-1.15a10.1 10.1 0 0 0 5.65 1.66h.01c5.48 0 9.95-4.47 9.95-9.95S17.52 2 12.04 2zm0 18.28a8.31 8.31 0 0 1-4.25-1.18l-.3-.18-2.6.68.7-2.54-.18-.31a8.26 8.26 0 0 1-1.26-4.4c0-4.56 3.71-8.28 8.28-8.28s8.28 3.71 8.28 8.28-3.71 8.28-8.28 8.28zm4.54-6.18c-.25-.13-1.46-.72-1.69-.8-.23-.09-.4-.13-.57.13s-.65.8-.8.97c-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.23-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.52.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.38-.79-1.89-.21-.5-.42-.43-.57-.44l-.48-.01c-.17 0-.45.06-.69.32s-.91.89-.91 2.17c0 1.27.93 2.5 1.06 2.67.13.17 1.83 2.8 4.45 3.92.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
                    </svg>
                  </a>

                  <a
                    href={broma.audioUrl}
                    download={`broma-${index + 1}.mp3`}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
                  >
                    <span className="text-lg">💾</span>
                    <span>Descargar Audio</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      );
    })()}
  </div>
)}





{visibleSection === "politica-de-cookies" && (
  <section
    className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
    style={{
      maxHeight: "calc(100vh - 5rem)",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      display: "block",
      overflowAnchor: "none",
    }}
  >
    <style jsx>{`
      section::-webkit-scrollbar {
        display: none;
      }
      section p {
        margin-bottom: 1.5rem;
      }
      section h4 {
        margin-bottom: 0.5rem;
      }
    `}</style>

    <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Política de cookies</h3>

    <div className="text-left">
      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">1. ¿Qué son las cookies?</h4>
        <p>
          Las cookies son pequeños archivos que se almacenan en tu dispositivo al navegar por una página web. Su función principal es mejorar tu experiencia, facilitando el funcionamiento y la personalización de la web.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">2. Cookies que utilizamos</h4>
        <p>
          En BromaIA utilizamos únicamente cookies técnicas esenciales que son necesarias para el correcto funcionamiento de la plataforma. Estas cookies permiten que puedas iniciar sesión, mantener tu sesión activa y asegurar la integridad y seguridad del servicio.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">3. Cookies de terceros</h4>
        <p>
          Nuestra plataforma utiliza servicios de terceros como Firebase para autenticación y Stripe para pagos. Estas plataformas pueden utilizar cookies técnicas para asegurar el correcto funcionamiento del servicio, pero no recopilamos datos personales mediante ellas ni las usamos con fines publicitarios o analíticos.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">4. Gestión y eliminación de cookies</h4>
        <p>
          Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento. Sin embargo, bloquear ciertas cookies técnicas puede afectar la funcionalidad de BromaIA, como la posibilidad de iniciar sesión o mantener tu cuenta activa.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">5. Contacto</h4>
        <p>
          Si tienes dudas sobre nuestra política de cookies o deseas más información, puedes contactarnos a través de la sección de contacto en la web.
        </p>
      </section>
    </div>
  </section>
)}

        {visibleSection === "faq" && (
          <section
            className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
              section p {
                margin-bottom: 1.5rem;
              }
              section h4 {
                margin-bottom: 0.5rem;
              }
            `}</style>

            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Preguntas Frecuentes (FAQ)</h3>

            <div className="text-left">
              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Qué es BromaIA?</h4>
                <p>
                  BromaIA es una plataforma que utiliza inteligencia artificial para crear bromas telefónicas personalizadas y en tiempo real, permitiendo grabar y compartir estas llamadas para entretenimiento.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Es legal usar BromaIA para realizar bromas?</h4>
                <p>
                  Sí, siempre que el uso sea responsable y cumpla con la legislación vigente, respetando la privacidad y derechos de terceros. Está prohibido usar la plataforma para fines ilegales, difamatorios o que puedan causar daño.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Se graban las llamadas?</h4>
                <p>
                  Sí, todas las llamadas se graban automáticamente para garantizar calidad y cumplimiento. Los usuarios y receptores deben estar informados y consentir la grabación conforme a la normativa aplicable.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Puedo usar BromaIA si soy menor de edad?</h4>
                <p>
                  No, el servicio está dirigido exclusivamente a mayores de 18 años. El uso por menores sin supervisión es responsabilidad de sus tutores legales.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Cómo protege BromaIA mis datos personales?</h4>
                <p>
                  BromaIA cumple con el RGPD y la legislación española de protección de datos, garantizando la seguridad, confidencialidad y el derecho de los usuarios a acceder, rectificar y eliminar sus datos.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Qué hago si recibo una broma que considero inapropiada?</h4>
                <p>
                  Puedes reportar cualquier abuso o contenido inapropiado a través del formulario de contacto. BromaIA revisará la denuncia y tomará las medidas necesarias, incluida la suspensión del usuario infractor.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Cómo puedo eliminar mi cuenta?</h4>
                <p>
                  Puedes solicitar la eliminación de tu cuenta y datos personales contactando con nuestro soporte mediante el formulario disponible en la sección de contacto.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2 mt-0">¿Qué pasa si uso BromaIA para fines comerciales?</h4>
                <p>
                  El uso comercial está prohibido salvo autorización expresa de BromaIA. Cualquier actividad comercial no autorizada podrá ser sancionada con la suspensión o cancelación de la cuenta.
                </p>
              </section>
            </div>
          </section>
        )}

        {visibleSection === "contacto" && (
          <section
            className="w-full max-w-6xl mx-auto px-8 pt-6 pb-4 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "block",
              overflowAnchor: "none",
              minWidth: "320px",
            }}
          >
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Contacto</h3>

            {!formSent ? (
              <form
                action="https://formspree.io/f/mdkzzdjb"
                method="POST"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  fetch(form.action, {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: new FormData(form),
                  }).then((response) => {
                    if (response.ok) setFormSent(true);
                  });
                }}
                className="flex flex-col gap-6 max-w-full"
                style={{ width: "100%" }}
              >
                <label className="flex flex-col w-full">
                  <span className="mb-2 font-semibold">Tu correo electrónico:</span>
                  <input
                    type="email"
                    name="email"
                    className="w-full h-14 p-4 rounded bg-gray-800 text-white text-lg"
                    placeholder="ejemplo@correo.com"
                    required
                    style={{ minWidth: "600px" }}
                  />
                </label>

                <label className="flex flex-col w-full">
                  <span className="mb-2 font-semibold">Tu mensaje:</span>
                  <textarea
                    name="message"
                    className="w-full h-40 p-4 rounded bg-gray-800 text-white text-lg resize-none"
                    placeholder="Escribe aquí tu mensaje."
                    required
                    style={{ minWidth: "600px" }}
                  />
                </label>

                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 transition-colors py-4 rounded font-semibold text-lg"
                  style={{ minWidth: "600px" }}
                >
                  Enviar mensaje
                </button>
              </form>
            ) : (
              <p className="text-center text-pink-300 text-lg font-semibold">
                ¡Gracias! Tu mensaje ha sido enviado con éxito.
              </p>
            )}
          </section>
        )}
{visibleSection === "politica-de-cookies" && (
  <section
    className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto"
    style={{
      maxHeight: "calc(100vh - 5rem)",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      display: "block",
      overflowAnchor: "none",
    }}
  >
    <style jsx>{`
      section::-webkit-scrollbar {
        display: none;
      }
      section p {
        margin-bottom: 1.5rem;
      }
      section h4 {
        margin-bottom: 0.5rem;
      }
    `}</style>

    {/* Usa aquí la clase sticky-title */}
    <h3 className="text-2xl font-bold mb-6 mt-0 text-center sticky-title">
      Política de cookies
    </h3>

    <div className="text-left">
      <section>
        <h4 className="font-bold text-lg mb-2 mt-0">1. ¿Qué son las cookies?</h4>
        <p>
          Las cookies son archivos pequeños que se almacenan en tu dispositivo al navegar por una web. Su función principal es mejorar la experiencia del usuario, recordando configuraciones o accesos previos.
        </p>
      </section>
      {/* ... resto del contenido ... */}
    </div>
  </section>
)}

        {visibleSection === "comprar-bromas" && (
          <section className="max-w-xl mx-auto px-4 pt-6 pb-4 text-white overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 mt-0 text-center">Comprar bromas</h3>
            <div className="space-y-4">
              <div className="border border-white rounded p-4 text-center">
                <p className="text-lg mb-2">🎉 1 broma – 0,99 €</p>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
                  onClick={() => actualizarBromas(bromasDisponibles + 1)}
                >
                  Comprar
                </button>
              </div>
              <div className="border border-white rounded p-4 text-center">
                <p className="text-lg mb-2">🔥 3 bromas – 2,99 €</p>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
                  onClick={() => actualizarBromas(bromasDisponibles + 3)}
                >
                  Comprar
                </button>
              </div>
              <div className="border border-white rounded p-4 text-center">
                <p className="text-lg mb-2">💥 5 bromas – 4,99 €</p>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
                  onClick={() => actualizarBromas(bromasDisponibles + 5)}
                >
                  Comprar
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}