"use client";
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

import { useState, useRef, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


import { doc, setDoc } from "firebase/firestore";
import Header from "./header/Header";
import MobileForm from "./components/MobileForm";

export default function Home() {
  const [message, setMessage] = useState("");
  const [voiceOption, setVoiceOption] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [started, setStarted] = useState(false);
  const [initialMessages, setInitialMessages] = useState<string[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [visibleSection, setVisibleSection] = useState<string | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mensajeEnviado, setMensajeEnviado] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [smsError, setSmsError] = useState("");
  const [bromasDisponibles, setBromasDisponibles] = useState<number>(0);
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    if (
      Array.isArray(initialMessages) &&
      initialMessages.length === 3 &&
      chat.length === 0 &&
      !processing
    ) {
      const timer = setTimeout(() => {
        setChat([
          {
            role: "ai",
            content: "⚠️ Para hacer la broma gratis tienes que estar registrado. Inicia sesión arriba 👆",
          },
        ]);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [initialMessages, chat, processing]);

  useEffect(() => {
    if (started && visibleSection === null) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, initialMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

 const verificarCodigo = async () => {
  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    await setDoc(doc(db, "users", user.uid), {
      phoneNumber: user.phoneNumber,
      credits: 3,
    });
    setCredits(3);
    setUserName(user.phoneNumber);
    localStorage.setItem("userName", user.phoneNumber);
    localStorage.setItem("bromaCredits", "3");
    setSmsError("✅ Verificación exitosa. ¡Bienvenido!");
  } catch (error) {
    console.error("Error al verificar código:", error);
    setSmsError("❌ Código incorrecto. Inténtalo de nuevo.");
  }
};


  const actualizarBromas = (nuevaCantidad: number) => {
    setBromasDisponibles(nuevaCantidad);
    localStorage.setItem("bromasDisponibles", nuevaCantidad.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

const handleStart = () => {
  if (phone && voiceOption && message) {
    setInitialMessages([phone, voiceOption, message]);
    console.log("📦 Valores guardados:", [phone, voiceOption, message]);
    setStarted(true);
  } else {
    alert("Faltan datos por rellenar");
  }
};



  const reset = () => {
    setStarted(false);
    setChat([]);
    setInitialMessages([]);
    setInitialMessage(null);
    setMessage("");
    setVisibleSection(null);
    setProcessing(false);
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

const handleSubmit = () => {
  setInitialMessages([
    phone,       // Ej: "+34 123456789"
    voiceOption, // Ej: "Voz femenina"
    message      // Ej: "Hola, es tu paquete perdido"
  ]);
  setStarted(true);
}

const handleSend = async () => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return;

  // Guarda los 3 mensajes iniciales si es la primera vez
  if (!started) {
    setInitialMessages([phone, voiceOption, trimmedMessage]);
    setStarted(true);
    setMessage("");
    return;
  }

  // Agrega mensaje del usuario al chat
  setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
  setMessage("");
  setProcessing(true);

  const responder = (texto: string) => {
    setChat((prev) => [...prev, { role: "ai", content: texto }]);
    setProcessing(false);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Verificaciones antes de responder
  if (!userName) {
    responder("⚠️ Debes registrarte para hacer la broma.");
    return;
  }

  if (credits <= 0) {
    responder("⚠️ No tienes bromas disponibles.");
    return;
  }

  try {
    // Pedimos la respuesta improvisada a OpenAI
    const res = await fetch("/api/openai-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmedMessage }),
    });

    const data = await res.json();
    const respuestaIA = data?.respuestaIA || "No se pudo generar la broma";

    responder(respuestaIA);

    // 🔊 Iniciar llamada real con Retell AI
    await fetch("/api/iniciar-llamada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: phone, voz: voiceOption, mensaje: respuestaIA }),
    });

    // 🔻 Resta 1 crédito
    const nuevosCreditos = credits - 1;
    setCredits(nuevosCreditos);
    localStorage.setItem("bromaCredits", nuevosCreditos.toString());
  } catch (error) {
    responder("❌ Error técnico. Inténtalo de nuevo.");
  }
};

  const handleComprarPack = async (cantidad: number) => {
    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No se pudo iniciar el pago.");
      }

      const containerExists = typeof window !== "undefined" && document.getElementById("recaptcha-container");
      if (!containerExists) {
        setSmsError("Error interno: recaptcha no encontrado");
        return;
      }
    } catch (err) {
      console.error("Error al crear la sesión de Stripe:", err);
      alert("Hubo un error al procesar el pago.");
    }
  };

  

const iniciarVerificacion = async () => {
  const cleanedPhone = phone.replace(/\s+/g, "");
  const finalPhone = cleanedPhone.startsWith("+34")
    ? cleanedPhone
    : `+34${cleanedPhone.startsWith("34") ? cleanedPhone.slice(2) : cleanedPhone}`;

  if (!finalPhone || finalPhone.length < 10) {
    setSmsError("Introduce un número de teléfono válido.");
    return;
  }

  const containerExists = typeof window !== 'undefined' && document.getElementById("recaptcha-container");
  if (!containerExists) {
    setSmsError("Error interno: reCAPTCHA no encontrado.");
    return;
  }

  try {
    // Si ya existe, límpialo antes
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    // Recreamos el reCAPTCHA (opcional pero más seguro)
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setSmsError("El reCAPTCHA ha expirado. Inténtalo de nuevo.");
        },
      },
      auth
    );

    

    const result = await signInWithPhoneNumber(auth, finalPhone, window.recaptchaVerifier);
    setConfirmationResult(result);
    setSmsError("✅ Código enviado. Revisa tu SMS.");
  } catch (error: any) {
    console.error("Error al enviar SMS:", error);
    let mensaje = "No se pudo enviar el SMS. Inténtalo más tarde.";
    if (error.code === "auth/too-many-requests") {
      mensaje = "Demasiados intentos. Espera unos minutos.";
    } else if (error.code === "auth/invalid-phone-number") {
      mensaje = "Número de teléfono inválido.";
    }
    setSmsError(`❌ ${mensaje}`);
  }
};




  console.log("Sección visible:", visibleSection);
  console.log("SECCIÓN ACTIVA:", visibleSection);
  console.log("MENSAJES EN CHAT:", chat);

  return (
    <>
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

     <div id="recaptcha-container"></div>



      {visibleSection === "que-es-bromaia" && (
        <div className="relative">
          <section
            className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 5rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overflowAnchor: "none",
            }}
          >
            <style jsx>{`
              section::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <h2 className="text-3xl font-bold text-center mb-10">¿Qué es BromaIA?</h2>
            <div className="text-left text-base space-y-6 leading-relaxed">
              <p>
                <strong>BromaIA</strong> es una plataforma digital que utiliza inteligencia artificial para crear bromas telefónicas personalizadas en tiempo real.
                A diferencia de las bromas tradicionales grabadas, aquí todo se genera al momento según lo que tú escribas.
              </p>
              <p>
                Simplemente introduces el mensaje o la situación que quieres gastar como broma, eliges el tipo de voz (masculina o femenina), y escribes el número de la persona destinataria.
                La IA interpretará el texto, hablará como si fuera una persona real y simulará una conversación espontánea y creíble.
              </p>
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>Escribir la broma que quieres gastar.</li>
                <li>Elegir el tipo de voz (masculina o femenina).</li>
                <li>Introducir el número de la persona a la que se va a llamar.</li>
              </ol>
              <p>
                La llamada se realiza automáticamente y queda grabada para que puedas escucharla, compartirla o descargarla. Todo funciona sin necesidad de apps ni instalaciones.
                Solo necesitas tu navegador.
              </p>
              <p>
                Además, gracias a la naturalidad de las voces, las pausas, las entonaciones y la improvisación de la IA, los resultados suenan tan reales que sorprenderán a cualquiera.
              </p>
              <p className="mt-4 italic text-center text-pink-400 text-lg">
                Tu idea. Nuestra voz. Una llamada inolvidable.
              </p>
            </div>
          </section>
          <div className="absolute top-0 right-0 w-[8px] h-full bg-black z-[999] pointer-events-none" />
        </div>
      )}

      {visibleSection === "ejemplos-de-bromaia" && (
        <section
          className="max-w-xl mx-auto px-4 pt-24 pb-6 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 4rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="sticky top-0 z-40 bg-black pt-2 pb-4">
            <h3 className="text-2xl font-bold text-center">Ejemplos de bromas</h3>
          </div>

          <div className="text-left mt-6 space-y-6 text-sm">
            <p>Estas son algunas ideas reales de lo que puedes hacer con BromaIA:</p>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-pink-400 font-semibold">🎁 Pedido extraño</p>
              <p className="text-white">"Hola, soy María del departamento de incidencias de XpressLogiCarriers. Nos aparece una incidencia por una compra de 17 muñecas hinchables personalizadas con el nombre 'Carmen'. ¿Desea devolución parcial o total?"</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-pink-400 font-semibold">🏖️ Sorteo inesperado</p>
              <p className="text-white">"Buenas tardes, le llamamos de IbizaTourClub. ¡Enhorabuena! Ha sido seleccionado para una noche en barco con barra libre, acompañante incluido... solo necesitamos que confirme su edad."</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-pink-400 font-semibold">📺 Reality falso</p>
              <p className="text-white">"Hola, le llamamos del casting de 'La Isla de las Tentaciones'. Necesitamos confirmar que usted es pareja de Alejandro y saber si le interesaría ir como soltera esta edición."</p>
            </div>

            <p className="italic text-center text-pink-400">
              Tú eliges el guion. BromaIA pone la voz.
            </p>
          </div>
        </section>
      )}

      {visibleSection === "comprar-bromas" && (
        <section
          className="max-w-xl mx-auto px-4 pt-24 pb-6 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 4rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="sticky top-0 z-40 bg-black pt-2 pb-4">
            <h3 className="text-2xl font-bold text-center">Comprar bromas</h3>
          </div>

          <div className="text-center text-sm space-y-6 mt-6">
            <p>Elige un pack de bromas y paga de forma segura con Stripe. No necesitas cuenta, solo tu tarjeta.</p>

            <div className="space-y-4">
              <div className="border border-white/20 rounded-lg p-4">
                <p className="text-lg font-semibold mb-2">🎉 1 broma – 0,99 €</p>
                <a
                  href="/api/checkout_sessions?cantidad=1"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
                >
                  Comprar 1 broma
                </a>
              </div>

              <div className="border border-white/20 rounded-lg p-4">
                <p className="text-lg font-semibold mb-2">🔥 3 bromas – 2,99 €</p>
                <a
                  href="/api/checkout_sessions?cantidad=3"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
                >
                  Comprar 3 bromas
                </a>
              </div>

              <div className="border border-white/20 rounded-lg p-4">
                <p className="text-lg font-semibold mb-2">💥 5 bromas – 4,99 €</p>
                <a
                  href="/api/checkout_sessions?cantidad=5"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
                >
                  Comprar 5 bromas
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {visibleSection === "terminos-y-condiciones" && (
        <section
          className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 5rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowAnchor: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <h2 className="text-3xl font-bold text-center mb-10">Términos y condiciones</h2>

          <div className="text-left text-base space-y-6 leading-relaxed">
            <p>
              Este documento establece los términos que regulan el uso de la plataforma BromaIA. Al acceder o utilizar nuestros servicios,
              aceptas expresamente estos términos. Recomendamos su lectura atenta antes de proceder.
            </p>

            <p>
              <strong>1. Objeto del servicio:</strong> BromaIA permite a los usuarios generar bromas telefónicas utilizando inteligencia artificial
              y recibir la grabación de la llamada resultante. Todo uso indebido será responsabilidad exclusiva del usuario.
            </p>

            <p>
              <strong>2. Edad mínima:</strong> Solo pueden utilizar este servicio personas mayores de 14 años. Si eres menor, necesitas el consentimiento de tus padres o tutores legales.
            </p>

            <p>
              <strong>3. Consentimiento y legalidad:</strong> Al utilizar este servicio, garantizas que tienes el derecho a introducir el número de teléfono al que se realiza la broma.
              No nos responsabilizamos de usos indebidos, ilegales o con intención de acoso.
            </p>

            <p>
              <strong>4. Grabaciones:</strong> Las llamadas realizadas se graban automáticamente y quedan disponibles para el usuario. Es responsabilidad del usuario obtener el consentimiento si desea publicar dichas grabaciones en redes sociales.
            </p>

            <p>
              <strong>5. Propiedad intelectual:</strong> Todo el contenido generado por BromaIA, incluyendo las voces y tecnologías utilizadas, está protegido por derechos de propiedad intelectual y no puede ser copiado, revendido ni reproducido sin autorización.
            </p>

            <p>
              <strong>6. Precios y pagos:</strong> El uso de BromaIA puede implicar costes asociados a la compra de bromas. Los precios pueden variar y se muestran claramente antes de cada compra. <strong>Los pagos se procesan a través de Stripe, una plataforma segura de pagos online que garantiza la protección de tus datos bancarios.</strong> No se permiten devoluciones una vez realizada la transacción salvo por fallo técnico.
            </p>

            <p>
              <strong>7. Uso indebido:</strong> Queda estrictamente prohibido el uso del servicio para acosar, amenazar, extorsionar o suplantar identidades. Cualquier infracción será motivo de expulsión inmediata de la plataforma y posible denuncia.
            </p>

            <p>
              <strong>8. Limitación de responsabilidad:</strong> BromaIA no se hace responsable de los efectos derivados del uso del servicio por parte de terceros, incluyendo malentendidos, consecuencias sociales o legales de las bromas realizadas.
            </p>

            <p>
              <strong>9. Disponibilidad del servicio:</strong> Nos reservamos el derecho a modificar, suspender o eliminar el servicio en cualquier momento sin previo aviso. Intentaremos siempre mantener una experiencia estable y funcional.
            </p>

            <p>
              <strong>10. Modificaciones de los términos:</strong> Estos términos pueden actualizarse periódicamente. El uso continuado del servicio implica la aceptación de los cambios realizados.
            </p>

            <p className="italic text-center text-pink-400 mt-8">
              Última actualización: junio de 2025.
            </p>
          </div>
        </section>
      )}

      {visibleSection === "politica-de-privacidad" && (
        <section
          className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 5rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowAnchor: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <h2 className="text-3xl font-bold text-center mb-10">Política de privacidad</h2>

          <div className="text-left text-base space-y-6 leading-relaxed">
            <p>
              En BromaIA, tu privacidad es una prioridad. Este documento explica cómo recopilamos, usamos y protegemos los datos personales que introduces en nuestra plataforma.
            </p>

            <p>
              Al registrarte con tu número de teléfono, almacenamos la información mínima necesaria para gestionar tu cuenta y realizar las llamadas. Estos datos incluyen: tu número, número del destinatario de la broma, créditos disponibles, y mensajes generados.
            </p>

            <p>
              Las grabaciones de las llamadas solo están accesibles para ti, y nunca serán compartidas sin tu consentimiento explícito. Puedes decidir si quieres subirlas a redes sociales, enviarlas por WhatsApp o mantenerlas privadas.
            </p>

            <p>
              Utilizamos servicios de terceros como Firebase y Retell AI, que también aplican medidas de protección avanzadas conforme al RGPD. Toda la información viaja encriptada y segura.
            </p>

            <p>
              No recopilamos datos sensibles ni accedemos a tu agenda ni contactos. Solo tratamos los datos que tú introduces directamente.
            </p>

            <p>
              Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos a nuestro formulario de contacto. También puedes eliminar tu cuenta desde el panel de usuario.
            </p>

            <p className="italic text-pink-400 text-center">
              En BromaIA, tu diversión es privada y protegida.
            </p>
          </div>
        </section>
      )}

      {visibleSection === "politica-de-cookies" && (
        <section
          className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 5rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowAnchor: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <h2 className="text-3xl font-bold text-center mb-10">Política de cookies</h2>

          <div className="text-left text-base space-y-6 leading-relaxed">
            <p>
              Nuestra web utiliza cookies para mejorar tu experiencia como usuario, analizar el uso de la plataforma y facilitar el proceso de compra de bromas.
            </p>

            <p>
              Las cookies que usamos son propias y de terceros (como Google Analytics o Stripe). Nos permiten, por ejemplo, saber cuántas personas visitan la web o detectar errores técnicos, siempre de forma anónima.
            </p>

            <p>
              No usamos cookies con fines publicitarios externos, ni vendemos tu información a terceros. Toda la información recolectada se utiliza exclusivamente para mejorar BromaIA.
            </p>

            <p>
              Puedes desactivar las cookies desde la configuración de tu navegador, aunque algunas funcionalidades podrían dejar de funcionar correctamente, como el sistema de créditos o la reproducción de llamadas.
            </p>

            <p>
              Al continuar navegando por la web o usar el sistema de bromas, aceptas nuestra política de cookies. Puedes revisar o cambiar tu consentimiento en cualquier momento desde los ajustes de tu navegador.
            </p>

            <p className="italic text-pink-400 text-center">
              Usamos cookies, pero solo para que la risa funcione mejor.
            </p>
          </div>
        </section>
      )}

      {visibleSection === "aviso-legal" && (
        <section
          className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 5rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowAnchor: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <h2 className="text-3xl font-bold text-center mb-10">Aviso legal</h2>

          <div className="text-left text-base space-y-6 leading-relaxed">
            <p>
              En cumplimiento del deber de información dispuesto en la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que la titularidad de esta plataforma corresponde a:
            </p>
            <p>
              <strong>Nombre comercial:</strong> BromaIA<br />
              <strong>Correo de contacto:</strong> contacto@bromaia.com
            </p>
            <p>
              El uso de esta plataforma implica la aceptación plena de las condiciones establecidas en este aviso legal, así como la política de privacidad, política de cookies y condiciones de uso.
            </p>
            <p>
              Está prohibida la reproducción total o parcial del contenido de BromaIA sin consentimiento expreso. La titular no se hace responsable del uso que terceros hagan de las grabaciones generadas, siendo los usuarios los únicos responsables del uso adecuado de las mismas.
            </p>
            <p>
              Todos los derechos de propiedad intelectual y de explotación de esta plataforma y su contenido pertenecen a la titular. Se reserva el derecho de modificar, eliminar o añadir contenido sin previo aviso.
            </p>
          </div>
        </section>
      )}

      {visibleSection === "contacto" && (
        <section
          className="max-w-xl mx-auto px-6 pt-[6.5rem] pb-10 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 5rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overflowAnchor: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <h2 className="text-3xl font-bold text-center mb-10">Contacto</h2>

          <p className="text-center mb-6">
            Si tienes dudas, sugerencias o quieres escribirnos, puedes enviarnos un mensaje usando este formulario o escribir directamente a <strong>contacto@bromaia.com</strong>.
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setMensajeEnviado(true);
            }}
          >
            <input
              type="text"
              placeholder="Tu nombre"
              required
              className="w-full p-3 rounded bg-pink-400 placeholder-white text-white focus:outline-none"
            />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              required
              className="w-full p-3 rounded bg-pink-400 placeholder-white text-white focus:outline-none"
            />
            <textarea
              placeholder="Escribe tu mensaje"
              required
              rows={4}
              className="w-full p-3 rounded bg-pink-400 placeholder-white text-white focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white py-2 rounded font-semibold transition"
            >
              Enviar mensaje
            </button>

            {mensajeEnviado && (
              <p className="text-green-400 text-center mt-4">✅ Tu mensaje se ha enviado con éxito.</p>
            )}
          </form>
        </section>
      )}

      {visibleSection === "faq" && (
        <section
          className="max-w-xl mx-auto px-4 pt-24 pb-6 text-white overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 4rem)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            section::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="sticky top-0 z-40 bg-black pt-2 pb-4">
            <h3 className="text-2xl font-bold text-center">Preguntas frecuentes (FAQ)</h3>
          </div>

          <div className="mt-6 space-y-6 text-sm">
            <div>
              <h4 className="font-semibold text-pink-400">¿Qué es exactamente BromaIA?</h4>
              <p>
                Es una plataforma que convierte un mensaje escrito en una llamada de broma totalmente automática, con voz humana generada por IA, y te entrega la grabación al instante.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-pink-400">¿Las llamadas son reales?</h4>
              <p>
                Sí. No son audios pregrabados. La IA genera la voz en tiempo real, improvisando y respondiendo como si fuera una persona auténtica. Puedes elegir el tipo de voz y personalizar el mensaje.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-pink-400">¿Se necesita instalar algo?</h4>
              <p>
                No. BromaIA funciona completamente desde el navegador, tanto en móvil como en ordenador. No necesitas descargar ninguna app.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-pink-400">¿Qué pasa si no tengo créditos?</h4>
              <p>
                Puedes comprar más bromas desde el apartado "Comprar bromas". Cada usuario nuevo tiene 3 bromas gratuitas si sube su reacción a TikTok mencionando a @bromaIA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-pink-400">¿Las bromas son legales?</h4>
              <p>
                Sí, siempre que se usen con responsabilidad. Está prohibido usar nombres de marcas reales o realizar bromas ofensivas o acosadoras. Las bromas deben ser respetuosas y con fines de entretenimiento.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 pt-24">
        {!started && !visibleSection && (
          <div className="hidden md:block w-full">
            <section id="pantalla1" className="w-full max-w-md mx-auto px-4 text-center pt-20">
              <h1 className="text-6xl font-extrabold mb-1 text-white">BromaIA</h1>
              <h2 className="text-lg font-medium mb-6 text-white sm:whitespace-normal whitespace-nowrap">
                Bromas telefónicas generadas con IA.
              </h2>

              <div className="text-sm text-white mb-2 sm:text-center text-left sm:ml-0 ml-[2%] whitespace-nowrap">
                Introduce 📞 de la persona que quieras gastar la broma:
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600000000"
                className="w-full bg-pink-400 text-white placeholder-white rounded-full px-4 py-3 mb-4 text-sm text-center focus:outline-none"
              />

              <div className="text-sm text-white mb-2 sm:text-center text-left sm:ml-0 ml-[2%] whitespace-nowrap">
                Elige el tipo de voz:
              </div>
              <select
                value={voiceOption}
                onChange={(e) => setVoiceOption(e.target.value)}
                className="w-full bg-pink-400 text-white rounded-full px-4 py-3 mb-4 text-sm text-center focus:outline-none appearance-none"
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

              <div className="text-sm text-white mb-2 sm:text-center text-left sm:ml-0 ml-[2%] whitespace-nowrap">
                La IA improvisa el resto y le pone la voz:
              </div>

              <div className="relative w-full mb-4" style={{ height: "90px" }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="  Escribe tu broma."
                  className="w-full h-full bg-pink-400 text-white placeholder-white px-4 pr-10 py-3 rounded-xl resize-none text-sm text-left leading-tight focus:outline-none"
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
              {/* Checkbox de términos */}
              <div className="flex items-start mb-4 text-white text-sm text-left ml-[2%]">
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
            </section>
          </div>
        )}

        {/* ✅ Pantalla 1 MÓVIL */}
        {!started && !visibleSection && (
          <div className="block md:hidden w-full">
            <MobileForm
              phone={phone}
              setPhone={setPhone}
              voiceOption={voiceOption}
              setVoiceOption={setVoiceOption}
              message={message}
              setMessage={setMessage}
              handleSend={handleSend}
              aceptaTerminos={aceptaTerminos}
              setAceptaTerminos={setAceptaTerminos}
              errorTerminos={errorTerminos}
            />
          </div>
        )}

{started && visibleSection === null && (
  <section className="w-full max-w-xl mx-auto h-screen flex flex-col bg-black text-white overflow-hidden">
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-4">
      {initialMessages[0] && (
        <div className="flex justify-end w-full">
          <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
            📱 Teléfono: {initialMessages[0]}
          </div>
        </div>
      )}
      {initialMessages[1] && (
        <div className="flex justify-end w-full">
          <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
            🗣️ Tipo de voz: {initialMessages[1]}
          </div>
        </div>
      )}
      {initialMessages[2] && (
        <div className="flex justify-end w-full">
          <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
            ✉️ Mensaje: {initialMessages[2]}
          </div>
        </div>
      )}

      {chat.map((msg, index) => (
        <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`${
              msg.role === "user"
                ? "bg-[#f472b6] text-white"
                : "bg-white text-black"
            } px-4 py-2 rounded-lg max-w-[75%]`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {processing && (
        <div className="flex justify-start w-full">
          <div className="bg-white text-black px-4 py-2 rounded-lg max-w-[75%]">
            Procesando...
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>

    <div className="fixed bottom-0 left-0 right-0 bg-black py-3 px-4 border-t border-gray-800">
      <div className="max-w-xl mx-auto relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="w-full bg-[#f472b6] text-white placeholder-white rounded-full px-4 py-2 pr-10 resize-none focus:outline-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          ›
        </button>
      </div>
    </div>
  </section>
)}
<div id="recaptcha-container" style={{ display: "none" }}></div>

    </div>
  </>
);
}
