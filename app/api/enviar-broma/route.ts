import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, message, userPhone, voiceOption } = body;

    // URL de Make (webhook)
    const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/zyplvlicvtkrcowp0gl8m9868n62nsdf";

    // Sanitizar número
    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34984179903`;

    console.log("📦 Enviando al webhook de Make:", {
      numeroFinal,
      message,
      userPhone,
      voiceOption,
    });

    // Enviar a Make
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telefono: numeroFinal,
        mensaje: message,
        userPhone: userPhone || "desconocido",
        voiceOption: voiceOption || "",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Error en webhook Make:", text);
      return NextResponse.json(
        { error: "Error enviando a Make", details: text },
        { status: 500 }
      );
    }

    console.log("✅ Webhook Make recibió correctamente");

    return NextResponse.json({
      success: true,
      message: "Enviado a Make correctamente",
    });
  } catch (error) {
    console.error("❌ Error general en enviar-broma:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", details: String(error) },
      { status: 500 }
    );
  }
}
