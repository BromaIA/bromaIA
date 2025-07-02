import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, message, userPhone, voiceOption } = body;

    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID || "agent_5ffdec4ca98d47828bb7426b8e";

    if (!RETELL_API_KEY) {
      console.error("❌ Falta RETELL_API_KEY en .env");
      return NextResponse.json(
        { error: "Falta configuración del servidor" },
        { status: 500 }
      );
    }

    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34${telefono}`;

    console.log("📦 BODY ENVIADO A RETELL:", {
      numeroFinal,
      message,
      userPhone,
      voiceOption,
    });

    const response = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        to_number: numeroFinal,
        from_number: "+34984179903", // tu número verificado
        metadata: {
          mensaje: message,  // 👈 esto es lo que escriben en la pantalla 2
          userPhone: userPhone || "desconocido",
          voiceOption: voiceOption || "",
        },
      }),
    });

    const rawText = await response.text();
    console.log("📄 RAW Retell:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Respuesta Retell no es JSON:", rawText);
      return NextResponse.json(
        { error: "Respuesta inválida de Retell", debug: rawText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("❌ Retell devolvió error:", data?.error || data);
      return NextResponse.json(
        { error: data?.error || "Error desconocido con Retell" },
        { status: 500 }
      );
    }

    console.log("✅ Retell OK:", data);

    return NextResponse.json({
      success: true,
      call_id: data.call_id,
    });
  } catch (error) {
    console.error("❌ Error general en enviar-broma:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", details: String(error) },
      { status: 500 }
    );
  }
}
