import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Webhook recibido de Retell:", JSON.stringify(body, null, 2));

    const callStatus = body.event || body.call_status || ""; // flexible
    const audioUrl = body.audio_url || body.recording_url || "";
    const metadata = body.metadata || {};
    const userPhone = metadata.userPhone || "desconocido";
    const mensaje = metadata.mensaje || "";
    const phone = metadata.telefono || "";

    if (callStatus === "call_completed" && audioUrl) {
      console.log("✅ Grabación disponible en:", audioUrl);

      // guardar en Firestore
      await setDoc(doc(db, "bromas", body.call_id || Date.now().toString()), {
        phone,
        audioUrl,
        mensaje,
        userPhone,
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Grabación guardada en Firestore correctamente");

      return NextResponse.json({ success: true });
    }

    console.log("ℹ️ Evento no relevante, ignorado:", callStatus);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error en retell-webhook:", error);
    return NextResponse.json(
      { error: "Error procesando el webhook" },
      { status: 500 }
    );
  }
}
