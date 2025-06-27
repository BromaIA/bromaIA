import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, message, userPhone, voiceOption } = body;

    // Cargamos claves de entorno
    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID || "agent_268ed5c70e35b741a2eb603c6f";

    if (!RETELL_API_KEY) {
      console.error("❌ Falta RETELL_API_KEY en .env");
      return NextResponse.json(
        { error: "Falta configuración del servidor" },
        { status: 500 }
      );
    }

    // Normalizamos el número a formato internacional
    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34${telefono}`;

    console.log("📦 BODY RECIBIDO", body);

    let response;
    try {
      response = await fetch("https://api.retellai.com/v2/register-phone-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RETELL_API_KEY}`,
        },
        body: JSON.stringify({
          agent_id: RETELL_AGENT_ID,
          to_number: numeroFinal,
          from_number: "+34984175959",
          direction: "outbound",
          call_type: "phone_call",
          metadata: {
            mensaje: message,
            userPhone: userPhone || "desconocido",
            voiceOption: voiceOption || "",
          },
        }),
      });
    } catch (fetchError) {
      console.error("❌ Error al conectar con Retell:", fetchError);
      return NextResponse.json(
        { error: "No se pudo conectar con Retell, revisa tu red o firewall" },
        { status: 502 }
      );
    }

    const rawText = await response.text();
    console.log("📄 RAW Retell:", rawText);
    console.log("🔎 Status Retell:", response.status);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      console.error("❌ Retell devolvió texto inválido:", rawText);
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
      debug: data,
    });
  } catch (error) {
    console.error("❌ Error general en enviar-broma:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", details: String(error) },
      { status: 500 }
    );
  }
}
