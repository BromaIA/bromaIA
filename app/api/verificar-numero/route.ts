import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📞 Numero recibido:", body.numero);  // para depuración en consola
    const numero = body.numero;

    if (!numero || typeof numero !== "string" || numero.length < 9) {
      return NextResponse.json(
        { valido: false, error: "Número inválido (demasiado corto o nulo)" },
        { status: 400 }
      );
    }

    // limpiar espacios y guiones
    const numeroLimpio = numero.replace(/\s|-/g, "");

    // Validación: opcional +34, seguido de 6 o 7, y 8 dígitos
    const isValid = /^(\+34)?(6|7)[0-9]{8}$/.test(numeroLimpio);

    console.log("✅ Numero limpio:", numeroLimpio, "valido:", isValid);

    return NextResponse.json({ valido: isValid });
  } catch (error) {
    console.error("❌ Error interno al verificar número:", error);
    return NextResponse.json(
      { valido: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
