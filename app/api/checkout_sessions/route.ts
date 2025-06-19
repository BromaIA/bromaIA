import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body recibido:", body);

    const cantidad = Number(body.cantidad);
    console.log("Cantidad convertida:", cantidad);

    const PRICE_MAP: Record<number, string> = {
      1: "price_1RbXUaGHFqQxr8sGQDV9gG0F",
      3: "price_1RbXUwGHFqQxr8sGWiPIj6oz",
      5: "price_1RbXVDGHFqQxr8sGhVR5JajH",
    };

    const priceId = PRICE_MAP[cantidad];
    console.log("priceId seleccionado:", priceId);

    if (!priceId) {
      return NextResponse.json({ error: "Precio no válido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `http://localhost:3000?success=${cantidad}`,
cancel_url: `http://localhost:3000?canceled=true`,
    });

    console.log("Sesión creada con id:", session.id);
console.log("URL base:", process.env.NEXT_PUBLIC_BASE_URL);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creando sesión:", error.message || error);
    return NextResponse.json({ error: "Error creando sesión" }, { status: 500 });
  }
}
