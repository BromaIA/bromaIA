// app/api/iniciar-llamada/route.ts
import { NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, voz, mensaje } = body;

    // ⚠️ Audio simulado (esto se reemplazará por Retell AI cuando lo integres)
    const fakeAudio = Buffer.from("SIMULATED_MP3_AUDIO_CONTENT");
    const fileName = `broma-${Date.now()}.mp3`;
    const audioRef = ref(storage, `audios/${fileName}`);

    await uploadBytes(audioRef, fakeAudio, {
      contentType: "audio/mpeg",
    });

    const audioUrl = await getDownloadURL(audioRef);

    // Guardamos la broma en Firestore
    await addDoc(collection(db, "historial"), {
      phone: telefono,
      voz,
      mensaje,
      fecha: Timestamp.now(),
      audioUrl,
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
