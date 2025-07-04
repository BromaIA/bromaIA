import { NextResponse } from "next/server";
import Retell from "retell-sdk";

console.log("✅ Retell API KEY:", process.env.RETELL_API_KEY);

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { telefono, mensaje, voiceOption, userPhone } = body;

    // 🟡 DEPURACIÓN para ver qué falla
    console.log("🟡 DEBUG datos recibidos:");
    console.log("telefono =>", telefono);
    console.log("mensaje =>", mensaje);
    console.log("voiceOption =>", voiceOption);
    console.log("userPhone =>", userPhone);

    if (!telefono || !mensaje || !voiceOption) {
      return NextResponse.json(
        { error: "Faltan datos: asegúrate de enviar telefono, mensaje y tipo de voz." },
        { status: 400 }
      );
    }

    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34${telefono}`;

    // detectar nombre de la persona en el mensaje:
    const nombreDetectado =
      mensaje.match(/(pregunta por|llama a|avisa a)\s+(\w+)/i)?.[2] || "amigo";

    console.log("🤖 ENVIANDO A RETELL:", {
      numeroFinal,
      mensaje,
      destinatario: nombreDetectado,
      tipo_voz: voiceOption,
      userPhone: userPhone || "desconocido",
    });

    const callResponse = await retell.call.createPhoneCall({
      from_number: process.env.TWILIO_PHONE_NUMBER!,
      to_number: numeroFinal,
      retell_llm_dynamic_variables: {
        mensaje, // lo que el usuario escribe
        destinatario: nombreDetectado, // parser que sacamos del mensaje
        tipo_voz: voiceOption,
        userPhone: userPhone || "desconocido",
      },
      custom_sip_headers: {
        "X-BromaIA": "broma",
      },
    });

    console.log("✅ RESPUESTA DE RETELL:", callResponse);

    return NextResponse.json({
      success: true,
      data: callResponse,
    });
  } catch (error: any) {
    console.error("❌ Error en enviar-broma:", error);
    return NextResponse.json(
      { error: error.message || "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
