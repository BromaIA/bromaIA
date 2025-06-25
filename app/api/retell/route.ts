import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telefono, mensaje, voz } = body;

    const res = await fetch("https://api.retellai.com/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: telefono,
        assistant_id: "YOUR_ASSISTANT_ID", // ← lo pondremos ahora
        user_input: mensaje,
      }),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al iniciar llamada con Retell:", error);
    return NextResponse.json(
      { success: false, error: "Error al iniciar la llamada" },
      { status: 500 }
    );
  }
}
