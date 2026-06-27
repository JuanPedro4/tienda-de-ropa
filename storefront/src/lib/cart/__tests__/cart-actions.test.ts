import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncCartWithMedusa } from "@/lib/cart/actions";

// ── Mocks ──

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/auth/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productVariant: {
      findUnique: (args: unknown) => mockFindUnique(args),
    },
  },
}));

// ── Fixtures ──

const authenticatedSession = {
  user: { email: "test@example.com", id: "u1", role: "CUSTOMER" },
};

const validItem = {
  variantId: "var-80",
  productId: "prod-1",
  name: "Body Manga Larga",
  size: "80",
  price: 1999,
  quantity: 2,
  maxQuantity: 10,
};

describe("syncCartWithMedusa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await syncCartWithMedusa([validItem]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("autenticado");
    }
  });

  it("returns error when session has no email", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });

    const result = await syncCartWithMedusa([validItem]);

    expect(result.success).toBe(false);
  });

  it("syncs successfully with an empty cart (no items)", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);

    const result = await syncCartWithMedusa([]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.syncedCount).toBe(0);
    }
  });

  it("validates each item and syncs successfully with valid items", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);
    mockFindUnique.mockResolvedValue({
      id: "var-80",
      inventoryQuantity: 10,
    });

    const result = await syncCartWithMedusa([validItem]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.syncedCount).toBe(1);
    }
  });

  it("returns error when a variant does not exist in the database", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);
    mockFindUnique.mockResolvedValue(null);

    const result = await syncCartWithMedusa([validItem]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("no encontrada");
    }
  });

  it("returns error when inventory is insufficient", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);
    mockFindUnique.mockResolvedValue({
      id: "var-80",
      inventoryQuantity: 1, // Only 1 in stock, but item has quantity 2
    });

    const result = await syncCartWithMedusa([validItem]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Stock insuficiente");
    }
  });

  it("returns error when an item has invalid data (e.g. quantity 0)", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);

    const invalidItem = { ...validItem, quantity: 0 };
    const result = await syncCartWithMedusa([invalidItem]);

    expect(result.success).toBe(false);
  });

  it("handles multiple items, reporting the first error", async () => {
    mockAuth.mockResolvedValue(authenticatedSession);
    mockFindUnique
      .mockResolvedValueOnce({ id: "var-80", inventoryQuantity: 10 })
      .mockResolvedValueOnce(null); // second item not found

    const result = await syncCartWithMedusa([
      validItem,
      { ...validItem, variantId: "var-missing" },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("no encontrada");
    }
  });
});
