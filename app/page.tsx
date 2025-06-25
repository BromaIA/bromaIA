"use client";
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

import React, { useState, useRef, useEffect } from "react";
import HistorialBromas from "./components/HistorialBromas";
import { auth, db } from "./lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { collection, query, getDocs } from "firebase/firestore";
import { subirAudioAFirebase } from "./lib/uploadAudio"; 
import { where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


import Header from "./header/Header";
import MobileForm from "./components/MobileForm";



export default function Home() {
  const [message, setMessage] = useState("");
  const [voiceOption, setVoiceOption] = useState("");
const [chat, setChat] = useState<{ role: "user" | "ai"; content: string | React.ReactNode }[]>([]);



  const [started, setStarted] = useState(false);
  const [initialMessages, setInitialMessages] = useState<string[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);

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

const [mostrarHistorial, setMostrarHistorial] = useState(false);

  
const [historial, setHistorial] = useState<any[]>([]);


 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.phoneNumber);
        // Aquí podrías cargar créditos si los guardas en Firestore
        // setCredits(...);
      } else {
        setUserName(null);
        setCredits(0);
      }
    });

    return () => unsubscribe();
  }, []);

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

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Usuario nuevo: damos 1 broma
      await setDoc(userRef, {
        phoneNumber: user.phoneNumber,
        credits: 1,
      });

      setCredits(1);
      localStorage.setItem("bromaCredits", "1");
    } else {
      // Usuario existente: mantenemos sus créditos
      const data = userSnap.data();
      const existingCredits = data?.credits ?? 0;

      setCredits(existingCredits);
      localStorage.setItem("bromaCredits", existingCredits.toString());
    }

    // Guardamos el nombre
    setUserName(user.phoneNumber);
    localStorage.setItem("userName", user.phoneNumber);

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


useEffect(() => {
  const cargarHistorial = async () => {
    if (!userName) return;

    try {
      const ref = collection(db, "bromas");
      const q = query(ref, where("userPhone", "==", userName));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setHistorial(data);
    } catch (error) {
      console.error("❌ Error al cargar historial:", error);
    }
  };

  cargarHistorial();
}, [userName]);

const reset = () => {
  setStarted(false);
  setChat([]);
  setInitialMessages([]);
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

  const handleSend = async () => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return;

  // 👉 Si aún no ha empezado la broma (pantalla 1)
  if (!started) {
    if (!phone || !voiceOption || !trimmedMessage) {
      alert("Faltan datos por rellenar");
      return;
    }
    if (!aceptaTerminos) {
      setErrorTerminos("Debes aceptar los términos para continuar.");
      return;
    }

    setInitialMessages([phone, voiceOption, trimmedMessage]);
    setStarted(true);
    setMessage("");
    return;
  }

  // 👉 Si ya está en la pantalla de conversación (pantalla 2)
  setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
  setMessage("");
  setProcessing(true);

  const responder = (contenido: React.ReactNode) => {
    setChat((prev) => [...prev, { role: "ai", content: contenido }]);
    setProcessing(false);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!userName) {
    responder("⚠️ Debes registrarte para hacer la broma.");
    return;
  }

  if (credits <= 0) {
    responder("⚠️ No tienes bromas disponibles.");
    return;
  }

  try {
    // Generar la respuesta con OpenAI
    const res = await fetch("/api/openai-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmedMessage }),
    });

    const data = await res.json();
    const respuestaIA = data?.respuestaIA || "No se pudo generar la broma";

    // 🔊 Iniciar llamada (simulada o real con Retell)
    const llamadaRes = await fetch("/api/iniciar-llamada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefono: phone,
        voz: voiceOption,
        mensaje: respuestaIA,
        userPhone: userName, // ✅ IMPORTANTE: añadir aquí para guardar en metadata
      }),
    });

    const llamadaData = await llamadaRes.json();
    const audioUrl = llamadaData.audioUrl || "/audios/broma-ejemplo.mp3";

    // Mostrar el audio generado en el chat
    const audioBubble = (
      <div className="flex flex-col gap-2">
        <audio controls src={audioUrl} className="w-full rounded-lg" />
        <div className="flex gap-3 text-sm">
          <a
            href={`https://api.whatsapp.com/send?text=¡Escucha esta broma! ${window.location.origin}${audioUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-green-400"
          >
            Compartir por WhatsApp
          </a>
          <a
            href={audioUrl}
            download
            className="underline text-blue-400"
          >
            Descargar audio
          </a>
        </div>
      </div>
    );

    responder(audioBubble);

    // Restar 1 crédito
    const nuevosCreditos = credits - 1;
    setCredits(nuevosCreditos);
    localStorage.setItem("bromaCredits", nuevosCreditos.toString());

    // ✅ GUARDAR EN FIRESTORE
    try {
      const bromaRef = doc(collection(db, "bromas"));
      await setDoc(bromaRef, {
        phone,
        mensaje: trimmedMessage,
        audioUrl,
        fecha: new Date().toISOString(),
        userPhone: userName,
      });
    } catch (error) {
      console.error("❌ Error guardando la broma en Firestore:", error);
    }

  } catch (error) {
    console.error("❌ Error en handleSend:", error);
    responder("❌ Error técnico. Inténtalo de nuevo.");
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

window.recaptchaVerifier = new (RecaptchaVerifier as any)(
  auth,
  "recaptcha-container",
  {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      setSmsError("El reCAPTCHA ha expirado. Inténtalo de nuevo.");
    },
  }
);


const enviarFormularioContacto = async (formulario: {
  nombre: string;
  email: string;
  mensaje: string;
}) => {
  try {
    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formulario),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Mensaje enviado correctamente.");
    } else {
      alert("Error al enviar el mensaje: " + data.error);
    }
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    alert("Error inesperado al enviar el mensaje.");
  }
};


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


useEffect(() => {
  console.log("Sección visible:", visibleSection);
  console.log("SECCIÓN ACTIVA:", visibleSection);
  console.log("MENSAJES EN CHAT:", chat);
  console.log("Mensajes iniciales guardados:", [phone, voiceOption, message]);
  console.log("initialMessages render:", initialMessages);
}, []);

const comprarBroma = async (cantidad: number) => {
  try {
    const res = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      console.error("Error: respuesta sin URL", data);
      alert("Error al crear la sesión de pago.");
    }
  } catch (error) {
    console.error("Error en comprarBroma:", error);
    alert("Hubo un error al procesar el pago.");
  }
};


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

      {visibleSection === "como-funciona-bromaia" && (
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

      <h2 className="text-3xl font-bold text-center mb-10">¿Cómo funciona BromaIA?</h2>
      <div className="text-left text-base space-y-6 leading-relaxed">
        <p>
          En <strong>BromaIA</strong>, tú escribes el mensaje o la situación que quieres convertir en una broma. Puedes ser tan creativo como quieras: nuestro asistente se encargará de interpretarlo.
        </p>
        <p>
          Una vez introducido el texto, eliges el tipo de voz (masculina o femenina) y el número al que se hará la llamada. La inteligencia artificial procesa tu idea y la transforma en una conversación espontánea, fluida y con voz natural.
        </p>
        <ol className="list-decimal list-inside ml-4 space-y-2">
          <li>Introduces el número al que se va a llamar. </li>
          <li>Seleccionas el tipo de voz que quieres usar.</li>
          <li>Escribes el mensaje o idea de la broma.</li>
        </ol>
        <p>
          La llamada se realiza en tiempo real y puede grabarse al instante. Así podrás escucharla, compartirla o revivirla cuando quieras. Todo desde el navegador, sin instalar nada.
        </p>
        <p>
          El sistema ajusta automáticamente el tono, las pausas y la entonación para que la broma suene realista, natural y sorprendentemente auténtica.
        </p>
        <p className="mt-4 italic text-center text-pink-400 text-lg">
          Tú escribes la idea. La IA la convierte en risa.
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

      <h2 className="text-3xl font-bold text-center mb-10">Comprar bromas</h2>

      <div className="text-left text-base space-y-6 leading-relaxed">
        <p className="text-center">
          Elige un pack de bromas y realiza el pago de forma segura.
        </p>

        <div className="space-y-6">
          <div className="border border-white/20 rounded-xl p-5 text-center">
            <p className="text-lg font-semibold mb-2">🎉 1 broma – 0,99 €</p>
            <button
              onClick={() => comprarBroma(1)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
            >
              Comprar 1 broma
            </button>
          </div>

          <div className="border border-white/20 rounded-xl p-5 text-center">
            <p className="text-lg font-semibold mb-2">🔥 3 bromas – 2,99 €</p>
            <button
              onClick={() => comprarBroma(3)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
            >
              Comprar 3 bromas
            </button>
          </div>

          <div className="border border-white/20 rounded-xl p-5 text-center">
            <p className="text-lg font-semibold mb-2">💥 5 bromas – 4,99 €</p>
            <button
              onClick={() => comprarBroma(5)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded inline-block"
            >
              Comprar 5 bromas
            </button>
          </div>
        </div>
      </div>
    </section>

    <div className="absolute top-0 right-0 w-[8px] h-full bg-black z-[999] pointer-events-none" />
  </div>
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

{visibleSection === "historial" && userName && (
  <div className="w-full bg-black text-white p-6 min-h-screen">
    <h2 className="text-xl font-bold mb-6 text-center">Historial de bromas</h2>

    <div className="max-w-2xl mx-auto">
      <HistorialBromas userPhone={userName} />
    </div>
  </div>
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

      <h2 className="text-3xl font-bold text-center mb-10">Contacto</h2>

      <p className="text-center mb-6">
        Si tienes dudas, sugerencias o quieres escribirnos, puedes enviarnos un mensaje usando este formulario o escribir directamente a <strong>contacto@bromaia.com</strong>.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);

          try {
            const res = await fetch("https://formspree.io/f/mdkzzdjb", {
              method: "POST",
              body: data,
              headers: {
                Accept: "application/json",
              },
            });

            if (res.ok) {
              form.reset();
              const success = document.getElementById("mensaje-enviado");
              if (success) success.style.display = "block";
            }
          } catch (error) {
            console.error("Error enviando formulario:", error);
          }
        }}
        className="space-y-4"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          required
          className="w-full p-3 rounded bg-pink-400 placeholder-white text-white focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Tu correo electrónico"
          required
          className="w-full p-3 rounded bg-pink-400 placeholder-white text-white focus:outline-none"
        />
        <textarea
          name="mensaje"
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
        <p
          id="mensaje-enviado"
          className="text-green-400 text-center mt-4 hidden"
        >
          ✅ Tu mensaje se ha enviado con éxito.
        </p>
      </form>
    </section>

    <div className="absolute top-0 right-0 w-[8px] h-full bg-black z-[999] pointer-events-none" />
  </div>
)}


      {visibleSection === "faq" && (
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

      <h2 className="text-3xl font-bold text-center mb-10">Preguntas frecuentes (FAQ)</h2>

      <div className="text-left text-base space-y-6 leading-relaxed">
        <div>
          <h3 className="font-semibold text-pink-400 mb-1">¿Qué es exactamente BromaIA?</h3>
          <p>
            Es una plataforma que convierte un mensaje escrito en una llamada de broma totalmente automática,
            con voz humana generada por IA. La llamada se realiza en tiempo real y la grabación se entrega al instante.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-pink-400 mb-1">¿Las llamadas son reales?</h3>
          <p>
            Sí. No se trata de audios pregrabados. La IA genera la voz en tiempo real e improvisa como si fuera una persona.
            Puedes elegir el tipo de voz y escribir el mensaje que deseas que diga.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-pink-400 mb-1">¿Se necesita instalar algo?</h3>
          <p>
            No. BromaIA funciona directamente desde el navegador, tanto en ordenador como en móvil. No hace falta descargar ninguna aplicación.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-pink-400 mb-1">¿Qué pasa si no tengo créditos?</h3>
          <p>
            Puedes comprar más bromas en la sección correspondiente. Además, los nuevos usuarios tienen acceso a 3 bromas gratuitas
            si suben su reacción a TikTok mencionando a <strong>@bromaIA</strong>.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-pink-400 mb-1">¿Las bromas son legales?</h3>
          <p>
            Sí, siempre que se usen con responsabilidad. No está permitido utilizar nombres de marcas reales,
            ni realizar bromas ofensivas o con fines de acoso. El objetivo es siempre el entretenimiento sano.
          </p>
        </div>
      </div>
    </section>

    <div className="absolute top-0 right-0 w-[8px] h-full bg-black z-[999] pointer-events-none" />
  </div>
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
    <div className="flex-1 overflow-y-auto px-4 pt-[9rem] pb-24 space-y-4">
      {initialMessages.length === 3 && (
        <>
          <div className="flex justify-end">
            <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
              📱 Teléfono: {initialMessages[0]}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
              🗣️ Tipo de voz: {initialMessages[1]}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#f472b6] text-white px-4 py-2 rounded-lg max-w-[75%]">
              ✉️ Mensaje: {initialMessages[2]}
            </div>
          </div>
        </>
      )}

      {chat.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`${
              msg.role === "user" ? "bg-[#f472b6] text-white" : "bg-white text-black"
            } px-4 py-2 rounded-lg max-w-[75%]`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {processing && (
        <div className="flex justify-start">
          <div className="bg-white text-black px-4 py-2 rounded-lg max-w-[75%]">
            Procesando...
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>

    <div className="fixed bottom-0 left-0 right-0 bg-black py-3 px-4 border-t border-black">

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
