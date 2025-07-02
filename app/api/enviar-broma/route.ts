import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, userPhone, voiceOption, message } = body;

    const RETELL_API_KEY = process.env.RETELL_API_KEY!;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!;
    const TWILIO_SID = process.env.TWILIO_SID!;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;

    if (!RETELL_API_KEY || !RETELL_AGENT_ID || !TWILIO_SID || !TWILIO_AUTH_TOKEN) {
      console.error("❌ Faltan variables de entorno");
      return NextResponse.json(
        { error: "Falta configuración en el servidor (.env)" },
        { status: 500 }
      );
    }

    const numeroFinal = telefono.startsWith("+34") ? telefono : `+34${telefono}`;

    console.log("📞 Registrando llamada en Retell:", numeroFinal);

    // Paso 1: registrar la llamada en Retell
    const retellResponse = await fetch(
      "https://api.retellai.com/v2/register-phone-call",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RETELL_API_KEY}`,
        },
        body: JSON.stringify({
          agent_id: RETELL_AGENT_ID,
          from_number: "+34984179903", // tu número Twilio
          to_number: numeroFinal,
          direction: "inbound",
          metadata: {
            mensaje: message,
            userPhone: userPhone || "desconocido",
            voiceOption: voiceOption || "",
          },
        }),
      }
    );

    const data = await retellResponse.json();
    console.log("✅ Respuesta register-phone-call:", data);

    if (!retellResponse.ok) {
      console.error("❌ Retell devolvió error:", data?.error || data);
      return NextResponse.json(
        { error: data?.error || "Error desconocido en Retell" },
        { status: 500 }
      );
    }

    const callId = data.call_id;

    // 👇 AQUI va la dirección SIP de tu trunk en Twilio
    const sipUri = `sip:${callId}@5t4n6j0wnrl.sip.livekit.cloud`;

    // Paso 2: lanzar la llamada desde Twilio
    const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    const twilioCall = await client.calls.create({
      to: sipUri,
      from: "+34984179903", // tu número Twilio
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
      sip_uri: sipUri,
      twilio_sid: twilioCall.sid,
    });
  } catch (error) {
    console.error("❌ Error general en enviar-broma:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", details: String(error) },
      { status: 500 }
    );
  }
}
