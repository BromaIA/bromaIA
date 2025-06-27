// app/api/verificar-numero/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const numero = body.numero;

    if (!numero || typeof numero !== "string" || numero.length < 9) {
      return NextResponse.json({ valido: false, error: "Número inválido" }, { status: 400 });
    }

    // Ejemplo de validación: empieza por +34 o 6/7 (número móvil español)
    const isValid = /^\+?34?(6|7)[0-9]{8}$/.test(numero);

    return NextResponse.json({ valido: isValid });
  } catch (error) {
    console.error("❌ Error interno al verificar número:", error);
    return NextResponse.json({ valido: false, error: "Error interno" }, { status: 500 });
  }
}
