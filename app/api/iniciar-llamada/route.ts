// app/api/iniciar-llamada/route.ts
import { NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const RETELL_API_KEY = process.env.RETELL_API_KEY!;
const RETELL_AGENT_ID = "agent_4b7c2762e9a6f32390522b9e0a"; // ✅ Tu Agent ID real de BromaIA

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, voz, mensaje, userPhone } = body;

    if (!telefono || !voz || !mensaje) {
      return NextResponse.json({ success: false, error: "Faltan datos" }, { status: 400 });
    }

    // 🔁 Llamada real a Retell AI
    const retellRes = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        phone_number: telefono,
        metadata: {
          mensaje_usuario: mensaje,
          voz: voz,
          userPhone: userPhone || "anónimo",
        },
      }),
    });

    const retellData = await retellRes.json();

    if (!retellRes.ok) {
      console.error("❌ Error Retell:", retellData);
      return NextResponse.json({ success: false, error: "Error desde Retell" }, { status: 500 });
    }

    // ✅ Guardar en Firestore
    await addDoc(collection(db, "historial"), {
      phone: telefono,
      voz,
      mensaje,
      userPhone: userPhone || null,
      fecha: Timestamp.now(),
      retellCallId: retellData.call_id || null,
    });

    return NextResponse.json({ success: true, callId: retellData.call_id });
  } catch (error) {
    console.error("❌ Error general:", error);
    return NextResponse.json(
      { success: false, error: "Error inesperado" },
      { status: 500 }
    );
  }
}
