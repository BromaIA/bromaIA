import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { telefono, voz, mensaje } = JSON.parse(req.body);

    // Aquí iría la llamada real a Retell AI o cualquier proveedor
    console.log("📞 Llamando a:", telefono);
    console.log("🗣️ Voz:", voz);
    console.log("💬 Mensaje:", mensaje);

    // Simulación exitosa
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al iniciar llamada:", error);
    res.status(500).json({ error: "Error al iniciar llamada" });
  }
}
