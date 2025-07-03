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

    if (!telefono || !mensaje || !voiceOption) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34${telefono}`;

    const callResponse = await retell.call.createPhoneCall({
      from_number: process.env.TWILIO_PHONE_NUMBER!,  // tu número validado en Retell
      to_number: numeroFinal,
      retell_llm_dynamic_variables: {
        mensaje,
        tipo_voz: voiceOption,
        userPhone: userPhone || "desconocido",
      },
      custom_sip_headers: {
        "X-BromaIA": "broma",
      },
    });

    console.log("✅ Respuesta Retell:", callResponse);

    return NextResponse.json({
      success: true,
      data: callResponse,
    });
  } catch (error: any) {
    console.error("❌ Error en enviar-broma:", error);
    return NextResponse.json(
      { error: error.message || "Error en el servidor" },
      { status: 500 }
    );
  }
}
