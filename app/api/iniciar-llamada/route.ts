import { NextResponse } from "next/server";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, voz, mensaje, tipo } = body; // tipo: "gratuita" o "pago"

    // 👉 Contar solo las llamadas gratuitas en total (sin filtrar por mes)
    const gratuitasQuery = query(
      collection(db, "bromas"),
      where("tipo", "==", "gratuita")
    );
    const snapshot = await getDocs(gratuitasQuery);

    if (tipo === "gratuita" && snapshot.size >= 192) {
      return NextResponse.json(
        {
          success: false,
          error: "No es posible realizar su broma. Se ha alcanzado el límite de bromas gratuitas. Solo están disponibles las bromas de pago. Lo sentimos.",
        },
        { status: 403 }
      );
    }

    // Simulación de audio generado
    const fakeAudio = Buffer.from("SIMULATED_MP3_AUDIO_CONTENT");
    const fileName = `broma-${Date.now()}.mp3`;
    const audioRef = ref(storage, `audios/${fileName}`);

    await uploadBytes(audioRef, fakeAudio, {
      contentType: "audio/mpeg",
    });

    const audioUrl = await getDownloadURL(audioRef);

    // Guardar en Firestore
    await addDoc(collection(db, "bromas"), {
      phone: telefono,
      voz,
      mensaje,
      fecha: Timestamp.now(),
      audioUrl,
      tipo,
    });

    return NextResponse.json({ success: true, audioUrl });

  } catch (error) {
    console.error("❌ Error al iniciar llamada:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar la broma" },
      { status: 500 }
    );
  }
}
