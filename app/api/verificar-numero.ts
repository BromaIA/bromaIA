// /pages/api/verificar-numero.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { numero } = req.body;

  try {
    const response = await fetch("https://api.retellai.com/v1/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
      },
      body: JSON.stringify({ phone_number: numero }),
    });

    const rawText = await response.text();
    let lookup: any = null;

    try {
      lookup = JSON.parse(rawText);
    } catch (e) {
      console.error("❌ Error al parsear JSON:", rawText);
      return res.status(500).json({ valido: false, error: "Respuesta no válida" });
    }

    console.log("📱 Resultado del lookup:", lookup);

    const esValido =
      lookup?.phoneNumber &&
      lookup?.carrier?.type &&
      lookup.carrier.type.toLowerCase() === "mobile";

    return res.status(200).json({ valido: esValido });
  } catch (error) {
    console.error("❌ Error en el handler:", error);
    return res.status(500).json({ valido: false });
  }
}
