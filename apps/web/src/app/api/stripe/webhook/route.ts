import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@toolnova/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId && planId && userId !== "anonymous") {
        const uid = parseInt(userId, 10);
        if (!isNaN(uid)) {
          const existing = await prisma.subscription.findUnique({ where: { userId: uid } });
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          if (existing) {
            await prisma.subscription.update({
              where: { userId: uid },
              data: {
                plan: planId,
                status: "active",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                expiresAt,
              },
            });
          } else {
            await prisma.subscription.create({
              data: {
                userId: uid,
                plan: planId,
                status: "active",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                expiresAt,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
