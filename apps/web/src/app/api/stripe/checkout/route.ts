import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { planId, userId } = await req.json();

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (planId === "free") {
      return NextResponse.json({ error: "Free plan cannot be purchased" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: (plan as (typeof PLANS)["pro" | "enterprise"]).priceId, quantity: 1 }],
      customer_email: undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId: userId ?? "anonymous", planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
