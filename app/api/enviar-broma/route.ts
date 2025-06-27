import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, message, userPhone } = body;

    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID || "agent_521c176cf266548aaf42225202";
    const VOICE_ID_SANTIAGO = "11labs-Santiago";

    const response = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        phone_number: telefono,
        input: message,
        voice_id: VOICE_ID_SANTIAGO,
        metadata: { userPhone: userPhone || "desconocido" },
      }),
    });

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error("❌ Retell devolvió texto inválido:", rawText);
      return NextResponse.json(
        { error: "Respuesta inválida de Retell", debug: rawText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("❌ Retell error status:", data?.error || data);
      return NextResponse.json(
        { error: data?.error || "Error con Retell AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, call_id: data.call_id });
  } catch (error) {
    console.error("❌ Error interno en enviar-broma:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
