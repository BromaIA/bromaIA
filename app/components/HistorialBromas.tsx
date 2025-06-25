"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Broma {
  phone: string;
  audioUrl: string;
  date: string;
  mensaje?: string;
}

export default function HistorialBromas({ userPhone }: { userPhone: string }) {
  const [bromas, setBromas] = useState<Broma[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBromas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bromas"), where("userPhone", "==", userPhone));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data() as Broma);
      const ordenadas = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setBromas(ordenadas);
    } catch (error) {
      console.error("Error cargando bromas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBromas();
  }, []);

  return (
    <section className="w-full max-w-xl mx-auto px-4 mt-6 space-y-6">
      <button
        onClick={fetchBromas}
        className="bg-white text-black text-sm px-4 py-2 rounded-xl mx-auto block hover:bg-zinc-200 transition"
      >
        🔄 Actualizar historial
      </button>

      {loading ? (
        <p className="text-white text-sm">Cargando historial...</p>
      ) : bromas.length === 0 ? (
        <p className="text-white text-sm text-center">No hay bromas aún.</p>
      ) : (
        bromas.map((broma, idx) => (
          <div
            key={idx}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-md"
          >
            <p className="text-sm text-zinc-400 mb-1">📞 {broma.phone}</p>
            {broma.mensaje && (
              <p className="text-xs text-zinc-500 mb-2">💬 {broma.mensaje}</p>
            )}
            <p className="text-xs text-zinc-500 mb-2">
              🗓️ {new Date(broma.date).toLocaleString()}
            </p>
            <audio
              controls
              src={broma.audioUrl}
              className="w-full mb-3 rounded"
              style={{ outline: "none" }}
            />
            <div className="flex gap-3 text-sm">
              <a
                href={`https://api.whatsapp.com/send?text=¡Escucha esta broma! ${encodeURIComponent(
                  broma.audioUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-green-400"
              >
                Compartir por WhatsApp
              </a>
              <a
                href={broma.audioUrl}
                download
                className="underline text-blue-400"
              >
                Descargar audio
              </a>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
