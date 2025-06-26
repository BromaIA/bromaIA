// app/api/retell-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { call_id, audio_url, phone_number, status, metadata } = body;

    if (status !== "completed" || !audio_url) {
      return NextResponse.json(
        { error: "Llamada no completada o sin audio" },
        { status: 400 }
      );
    }

    const userPhone = metadata?.userPhone || "desconocido";
    const mensaje = metadata?.mensaje || "";
    const voz = metadata?.voz || "";

    await setDoc(doc(db, "bromas", call_id), {
      phone: phone_number,
      userPhone,
      mensaje,
      voz,
      audioUrl: audio_url,
      date: new Date().toISOString(),
    });

    console.log("✅ Broma guardada para usuario:", userPhone);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error al guardar la broma:", error);
    return NextResponse.json(
      { error: "Error al guardar en Firestore" },
      { status: 500 }
    );
  }
}
