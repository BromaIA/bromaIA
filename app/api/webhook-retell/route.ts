import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telefono, mensaje, userPhone, voiceOption } = body;

    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!;
    const TWILIO_SID = process.env.TWILIO_SID!;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
    const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!;  // tu trunk de Twilio

    if (!RETELL_API_KEY || !RETELL_AGENT_ID || !TWILIO_SID || !TWILIO_AUTH_TOKEN) {
      console.error("❌ Faltan variables de entorno");
      return NextResponse.json(
        { error: "Falta configuración en el servidor (.env)" },
        { status: 500 }
      );
    }

    const numeroFinal = telefono.startsWith("+34")
      ? telefono
      : `+34${telefono}`;

    // REGISTRAR llamada en Retell
    const res = await fetch("https://api.retellai.com/v2/register-phone-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        to_number: numeroFinal,
        from_number: FROM_NUMBER,
        direction: "inbound",
        metadata: {
          userPhone,
          mensaje,
          voiceOption,
        },
      }),
    });

    const data = await res.json();
    console.log("✅ Retell register-phone-call: ", data);

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error || "Error en register-phone-call" },
        { status: 500 }
      );
    }

    const callId = data.call_id;
    const sipUri = `sip:${callId}@5t4n6j0wnrl.sip.livekit.cloud`;

    // Iniciar llamada con Twilio
    const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
    const twilioCall = await client.calls.create({
      to: sipUri,
      from: FROM_NUMBER,
      twiml: `
        <Response>
          <Dial>
            <Sip>${sipUri}</Sip>
          </Dial>
        </Response>
      `,
    });

    console.log("📞 Llamada Twilio lanzada:", twilioCall.sid);

    return NextResponse.json({
      success: true,
      call_id: callId,
      twilio_sid: twilioCall.sid,
    });
  } catch (error) {
    console.error("❌ Error general webhook:", error);
    return NextResponse.json(
      { error: "Error general en el servidor" },
      { status: 500 }
    );
  }
}
