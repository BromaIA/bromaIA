import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telefono, mensaje, userPhone, voiceOption } = body;

    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!;
    const FROM_NUMBER = process.env.RETELL_FROM_NUMBER!;  // tu número verificado en Retell

    const numeroFinal = telefono.startsWith("+34")
      ? telefono
      : `+34${telefono}`;

    const res = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        to_number: numeroFinal,
        from_number: FROM_NUMBER,
        metadata: {
          userPhone,
          mensaje,
          voz: voiceOption,
        },
      }),
    });

    const data = await res.json();

    console.log("✅ Retell respondió: ", data);

    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, call_id: data.call_id });
  } catch (error) {
    console.error("❌ Error al enviar llamada a Retell:", error);
    return NextResponse.json(
      { error: "Error al enviar la llamada" },
      { status: 500 }
    );
  }
}
