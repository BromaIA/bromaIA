import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, audioUrl, mensaje, userPhone } = body;

    if (!phone || !audioUrl || !userPhone) {
      return NextResponse.json(
        { error: "Faltan datos para guardar la broma." },
        { status: 400 }
      );
    }

    await addDoc(collection(db, "bromas"), {
      phone,
      audioUrl,
      mensaje: mensaje || "",
      userPhone,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error guardando la broma:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la broma." },
      { status: 500 }
    );
  }
}
