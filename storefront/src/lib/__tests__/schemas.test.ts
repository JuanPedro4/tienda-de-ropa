import { describe, it, expect } from "vitest";
import {
  ProductSchema,
  VariantSchema,
  CreateCheckoutSessionSchema,
  ReviewSchema,
} from "@tienda/shared/schemas";
import { z } from "zod";

// ── Helpers ──

const validProduct = {
  title: "Body manga larga",
  description: "Body de algodón orgánico para bebé con estampado de osito.",
  handle: "body-manga-larga",
  categoryId: "550e8400-e29b-41d4-a716-446655440000",
  images: ["https://example.com/img.jpg"],
};

const validVariant = {
  productId: "550e8400-e29b-41d4-a716-446655440000",
  sku: "BOD-001-80",
  title: "80",
  size: "80",
  price: 1999,
  inventoryQuantity: 10,
};

const validCheckout = {
  items: [
    {
      variantId: "v1",
      productId: "p1",
      name: "Body manga larga",
      size: "80",
      price: 1999,
      quantity: 1,
    },
  ],
  customerEmail: "test@example.com",
  customerName: "María García",
  storeId: "s1",
};

const validReview = {
  productId: "550e8400-e29b-41d4-a716-446655440000",
  rating: 4,
  comment: "Muy buena calidad, la tela es suave.",
};

// ──────────────────────────────────────────────
// ProductSchema
// ──────────────────────────────────────────────

describe("ProductSchema", () => {
  it("accepts a valid product", () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects product with title too short", () => {
    const result = ProductSchema.safeParse({ ...validProduct, title: "X" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("title"))).toBe(
        true,
      );
    }
  });

  it("rejects product with missing description", () => {
    const { description, ...noDesc } = validProduct;
    const result = ProductSchema.safeParse(noDesc);
    expect(result.success).toBe(false);
  });

  it("rejects product with description too short", () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      description: "Corto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid handle characters", () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      handle: "Body Manga Larga!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid categoryId", () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      categoryId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects product with empty images array", () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      images: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects product with more than 10 images", () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      images: Array.from({ length: 11 }, (_, i) => `https://example.com/${i}.jpg`),
    });
    expect(result.success).toBe(false);
  });

  it("accepts product with optional fields omitted", () => {
    const minimal = {
      title: "Body básico",
      description: "Un body básico de algodón.",
      handle: "body-basico",
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
      images: ["https://example.com/img.jpg"],
    };
    const result = ProductSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});

// ──────────────────────────────────────────────
// VariantSchema
// ──────────────────────────────────────────────

describe("VariantSchema", () => {
  it("accepts a valid variant", () => {
    const result = VariantSchema.safeParse(validVariant);
    expect(result.success).toBe(true);
  });

  it("rejects variant with negative price", () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects variant with price zero", () => {
    const result = VariantSchema.safeParse({ ...validVariant, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects variant with negative inventory", () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      inventoryQuantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects variant with short SKU", () => {
    const result = VariantSchema.safeParse({ ...validVariant, sku: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects variant with title too short", () => {
    const result = VariantSchema.safeParse({ ...validVariant, title: "A" });
    expect(result.success).toBe(false);
  });

  it("accepts variant with optional color", () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      color: "azul",
    });
    expect(result.success).toBe(true);
  });

  it("defaults allowBackorder to false", () => {
    const { allowBackorder, ...withoutBackorder } = validVariant;
    const result = VariantSchema.parse(withoutBackorder);
    expect(result.allowBackorder).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      inventoryQuantity: 5.5,
    });
    expect(result.success).toBe(false);
  });
});

// ──────────────────────────────────────────────
// CreateCheckoutSessionSchema
// ──────────────────────────────────────────────

describe("CreateCheckoutSessionSchema", () => {
  it("accepts a valid checkout session", () => {
    const result = CreateCheckoutSessionSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("rejects checkout with empty items", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects checkout with invalid email", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      customerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects checkout with short customer name", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      customerName: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects checkout item with quantity zero", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0]!, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects checkout item with negative price", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0]!, price: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects checkout with quantity > 10", () => {
    const result = CreateCheckoutSessionSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0]!, quantity: 11 }],
    });
    expect(result.success).toBe(false);
  });

  it("applies default URLs when omitted", () => {
    const { successUrl, cancelUrl, ...withoutUrls } = validCheckout;
    const result = CreateCheckoutSessionSchema.parse(withoutUrls);
    expect(result.successUrl).toBe("https://localhost:3000/checkout/success");
    expect(result.cancelUrl).toBe("https://localhost:3000/carrito");
  });
});

// ──────────────────────────────────────────────
// ReviewSchema
// ──────────────────────────────────────────────

describe("ReviewSchema", () => {
  it("accepts a valid review", () => {
    const result = ReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejects review with rating below 1", () => {
    const result = ReviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects review with rating above 5", () => {
    const result = ReviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects review with non-integer rating", () => {
    const result = ReviewSchema.safeParse({ ...validReview, rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects review with comment too short", () => {
    const result = ReviewSchema.safeParse({
      ...validReview,
      comment: "Corto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects review with comment too long", () => {
    const result = ReviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts review without comment", () => {
    const { comment, ...noComment } = validReview;
    const result = ReviewSchema.safeParse(noComment);
    expect(result.success).toBe(true);
  });

  it("rejects review with invalid productId", () => {
    const result = ReviewSchema.safeParse({
      ...validReview,
      productId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts review with optional orderId", () => {
    const result = ReviewSchema.safeParse({
      ...validReview,
      orderId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });
});
