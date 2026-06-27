import { z } from "zod";

// ──────────────────────────────────────────────
// Cart item (input / minimal)
// ──────────────────────────────────────────────
export const CartItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1).max(10),
});

export type CartItemInput = z.infer<typeof CartItemSchema>;

// ──────────────────────────────────────────────
// Full cart item (store representation)
// ──────────────────────────────────────────────
export const FullCartItemSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
  name: z.string(),
  size: z.string(),
  color: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().positive(), // cents
  quantity: z.number().int().min(1).max(10),
  maxQuantity: z.number().int().min(0),
});

export type FullCartItem = z.infer<typeof FullCartItemSchema>;

// ──────────────────────────────────────────────
// Checkout session creation
// ──────────────────────────────────────────────
export const CreateCheckoutSessionSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        productId: z.string(),
        name: z.string(),
        size: z.string(),
        price: z.number().positive(), // cents
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(100),
  storeId: z.string(),
  successUrl: z.string().url().default("https://localhost:3000/checkout/success"),
  cancelUrl: z.string().url().default("https://localhost:3000/carrito"),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

// ──────────────────────────────────────────────
// Stripe webhook event (validated)
// ──────────────────────────────────────────────
export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  created: z.number(),
});

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

// ──────────────────────────────────────────────
// Order status
// ──────────────────────────────────────────────
export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "CANCELLED",
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// ──────────────────────────────────────────────
// Order summary (read response)
// ──────────────────────────────────────────────
export const OrderSummarySchema = z.object({
  orderId: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  total: z.number().positive(),
  currency: z.string().length(3),
  status: OrderStatusEnum,
  storeId: z.string(),
  storeName: z.string(),
  storeAddress: z.string(),
  items: z.array(z.unknown()),
  pickupCode: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type OrderSummary = z.infer<typeof OrderSummarySchema>;

// ──────────────────────────────────────────────
// Admin action schemas
// ──────────────────────────────────────────────
export const MarkReadySchema = z.object({
  orderId: z.string(),
});

export type MarkReadyInput = z.infer<typeof MarkReadySchema>;

export const MarkPickedUpSchema = z.object({
  orderId: z.string(),
  code: z.string().length(6),
});

export type MarkPickedUpInput = z.infer<typeof MarkPickedUpSchema>;
