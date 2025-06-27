import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { telefono, message, userPhone, voiceOption } = body;

  const RETELL_API_KEY = process.env.RETELL_API_KEY!;
  const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!;

  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    return NextResponse.json(
      { error: "Faltan claves en .env" },
      { status: 500 }
    );
  }

  try {
    // abrimos el websocket
    const WebSocket = require("ws");
    const ws = new WebSocket("wss://api.retellai.com/v1/calls", {
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
    });

    return await new Promise((resolve, reject) => {
      ws.on("open", () => {
        console.log("✅ WebSocket conectado");

        // lanzamos la llamada
        ws.send(
          JSON.stringify({
            agent_id: RETELL_AGENT_ID,
            phone_number: telefono,
            voice_id:
              voiceOption === "voz2"
                ? "11labs-Santiago"
                : "11labs-Lucia",
            input: message,
            metadata: { userPhone: userPhone ?? "desconocido" },
          })
        );
      });

      ws.on("message", (data: string) => {
        console.log("📞 Respuesta Retell:", data);

        const parsed = JSON.parse(data);
        if (parsed.call_id) {
          resolve(
            NextResponse.json({
              success: true,
              call_id: parsed.call_id,
            })
          );
          ws.close();
        }
      });

      ws.on("error", (err: Error) => {
        console.error("❌ Error WebSocket:", err);
        reject(
          NextResponse.json({ error: err.message }, { status: 500 })
        );
      });

      ws.on("close", () => {
        console.log("🔌 WebSocket cerrado");
      });
    });
  } catch (error: any) {
    console.error("❌ Error general:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
