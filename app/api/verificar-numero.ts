import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { numero } = await req.json();

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
      return NextResponse.json({ valido: false, error: "Respuesta no válida" }, { status: 500 });
    }

    console.log("📱 Resultado del lookup:", lookup);

    const esValido =
      lookup?.phoneNumber &&
      lookup?.carrier?.type &&
      lookup.carrier.type.toLowerCase() === "mobile";

    return NextResponse.json({ valido: esValido });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ valido: false }, { status: 500 });
  }
}
