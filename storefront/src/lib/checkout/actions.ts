"use server";

import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CreateCheckoutSessionSchema } from "@tienda/shared/schemas";

// ──────────────────────────────────────────────
// Stripe client (singleton)
// ──────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no está configurada");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

// ──────────────────────────────────────────────
// createCheckoutSession
//
// Validates cart items with Zod, verifies stock via Prisma,
// creates a Stripe Checkout Session, and returns the redirect URL.
// ──────────────────────────────────────────────

export async function createCheckoutSession(
  input: z.infer<typeof CreateCheckoutSessionSchema>,
): Promise<{ url: string | null; error?: string }> {
  try {
    // ── Validate input ──
    const parsed = CreateCheckoutSessionSchema.parse(input);

    // ── Verify store exists and is active ──
    const store = await prisma.store.findUnique({
      where: { id: parsed.storeId },
    });

    if (!store || !store.isActive) {
      return { url: null, error: "La sucursal seleccionada no está disponible" };
    }

    // ── Verify stock for each item ──
    // Note: In production, variants live in Medusa. Here we verify
    // against local Prisma variant records.
    for (const item of parsed.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant) {
        return {
          url: null,
          error: `Producto no encontrado: ${item.name}`,
        };
      }

      if (variant.inventoryQuantity < item.quantity) {
        return {
          url: null,
          error: `Stock insuficiente para "${item.name}" (talle ${item.size}). Disponible: ${variant.inventoryQuantity}`,
        };
      }
    }

    // ── Build line items for Stripe ──
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      parsed.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.name} - Talle ${item.size}`,
          },
          unit_amount: item.price, // already in cents
        },
        quantity: item.quantity,
      }));

    // ── Determine success / cancel URLs ──
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const successUrl = parsed.successUrl || `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = parsed.cancelUrl || `${siteUrl}/carrito`;

    // ── Create Stripe Checkout Session ──
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.customerEmail,
      line_items: lineItems,
      metadata: {
        storeId: parsed.storeId,
        customerName: parsed.customerName,
        items: JSON.stringify(
          parsed.items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        ),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: "es",
    });

    // ── Create a pending order record ──
    await prisma.order.create({
      data: {
        customerEmail: parsed.customerEmail,
        customerName: parsed.customerName,
        items: parsed.items,
        total: parsed.items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0,
        ),
        currency: "EUR",
        status: "PENDING",
        storeId: parsed.storeId,
        stripeSessionId: session.id,
      },
    });

    if (!session.url) {
      return { url: null, error: "Error al crear la sesión de pago" };
    }

    return { url: session.url };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { url: null, error: "Datos de checkout inválidos" };
    }
    console.error("[createCheckoutSession]", err);
    return { url: null, error: "Error al procesar el checkout" };
  }
}
