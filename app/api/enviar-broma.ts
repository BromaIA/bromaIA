import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { telefono, voz, mensaje, userPhone } = JSON.parse(req.body);

    const RETELL_API_KEY = process.env.RETELL_API_KEY;
    const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID || "agent_521c176cf266548aaf42225202";

    if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
      return res.status(500).json({ error: "Faltan variables de entorno" });
    }

    const response = await fetch("https://api.retellai.com/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        phone_number: telefono,
        input: mensaje,
        voice_id: voz,
        metadata: {
          userPhone: userPhone || "desconocido",
        },
      }),
    });

    // Primero capturamos la respuesta como texto
    const rawText = await response.text();
    console.log("📨 Respuesta CRUDA de Retell:", rawText);

    // Luego intentamos parsearla como JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error("❌ La respuesta de Retell no es JSON válido:", error);
      return res.status(500).json({
        error: "La respuesta de Retell no es JSON válido. Mira consola para más info.",
        debug: rawText,
      });
    }

    if (!response.ok) {
      console.error("❌ Error de Retell:", data);
      return res.status(500).json({ error: data?.error || "Error al llamar a Retell AI" });
    }

    console.log("✅ Llamada iniciada con ID:", data.call_id);

    return res.status(200).json({ success: true, call_id: data.call_id });
  } catch (error) {
    console.error("❌ Error general al iniciar la llamada:", error);
    return res.status(500).json({ error: "Error interno al iniciar la llamada" });
  }
}
