import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { invalidatePattern } from "@/lib/cache";

// ──────────────────────────────────────────────
// Stripe client (singleton)
// ──────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no está configurada");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

// ──────────────────────────────────────────────
// Webhook secret
// ──────────────────────────────────────────────

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET no está configurada");
  }
  return secret;
}

// ──────────────────────────────────────────────
// POST /api/webhooks/stripe
// ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Firma webhook faltante" },
        { status: 400 },
      );
    }

    // ── Verify signature ──
    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret(),
      );
    } catch (err) {
      console.error("[stripe-webhook] Invalid signature:", err);
      return NextResponse.json(
        { error: "Firma inválida" },
        { status: 400 },
      );
    }

    // ── Idempotency check ──
    const existing = await prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existing) {
      // Already processed — respond 200 to acknowledge receipt
      return NextResponse.json({ received: true, idempotent: true });
    }

    // ── Record event for idempotency ──
    await prisma.stripeEvent.create({
      data: {
        id: event.id,
        stripeEventId: event.id,
        type: event.type,
      },
    });

    // ── Handle event types ──
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "checkout.session.expired": {
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// Event handlers
// ──────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const customerEmail = session.customer_email ?? "";
  const metadata = session.metadata ?? {};

  // ── Find the pending order ──
  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
  });

  if (!order) {
    console.error(
      `[stripe-webhook] Order not found for session: ${sessionId}`,
    );
    return;
  }

  if (order.status !== "PENDING") {
    console.log(
      `[stripe-webhook] Order ${order.id} already processed (status: ${order.status})`,
    );
    return;
  }

  // ── Parse items from metadata ──
  const items: Array<{ variantId: string; quantity: number }> = metadata.items
    ? JSON.parse(metadata.items)
    : [];

  // ── Update order to CONFIRMED ──
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      customerEmail,
      customerName:
        metadata.customerName ?? session.customer_details?.name ?? "",
    },
  });

  // ── Decrement inventory ──
  for (const item of items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        inventoryQuantity: {
          decrement: item.quantity,
        },
      },
    });
  }

  // ── Invalidate product cache ──
  // TODO: Get affected product handles from variant data
  await invalidatePattern("cache:product:*");
  await invalidatePattern("cache:products");

  // ── Send confirmation email (placeholder) ──
  // TODO: Integrate with Resend or similar email service
  console.log(
    `[stripe-webhook] Order ${order.id} confirmed for ${customerEmail}`,
    `-- TODO: Send confirmation email to ${customerEmail}`,
  );
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const sessionId = session.id;

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
  });

  if (!order || order.status !== "PENDING") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  console.log(
    `[stripe-webhook] Order ${order.id} cancelled (session expired)`,
  );
}
