import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitReview,
  approveReview,
} from "@/lib/reviews/actions";

// ── Mocks ──

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockOrderFindUnique = vi.fn();

vi.mock("@/lib/auth/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: (args: unknown) => mockFindUnique(args),
      create: (args: unknown) => mockCreate(args),
      update: (args: unknown) => mockUpdate(args),
    },
    order: {
      findUnique: (args: unknown) => mockOrderFindUnique(args),
    },
  },
}));

// Mock next/navigation redirect to throw so it's caught by the action's catch block
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// ── Fixtures ──

const authenticatedCustomer = {
  user: { id: "user-1", email: "customer@test.com", role: "CUSTOMER" },
};

const authenticatedAdmin = {
  user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
};

// ──────────────────────────────────────────────
// submitReview
// ──────────────────────────────────────────────

describe("submitReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a review successfully with valid data", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);
    mockFindUnique.mockResolvedValue(null); // no existing review
    mockCreate.mockResolvedValue({ id: "review-1" });

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      4,
      "Muy buena calidad, la tela es suave.",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.reviewId).toBe("review-1");
    }
  });

  it("returns error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      4,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("autenticado");
    }
  });

  it("returns validation error for rating below 1", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      0,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("1 y 5");
    }
  });

  it("returns validation error for rating above 5", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      6,
    );

    expect(result.success).toBe(false);
  });

  it("returns error when user already reviewed this product", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);
    mockFindUnique.mockResolvedValue({ id: "existing-review" });

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      4,
      "Buena calidad.",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Ya has reseñado");
    }
  });

  it("returns error for comment shorter than 10 characters", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);
    mockFindUnique.mockResolvedValue(null);

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      4,
      "Corto", // less than 10 chars
    );

    expect(result.success).toBe(false);
  });

  it("submits without comment when not provided", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "review-2" });

    const result = await submitReview(
      "550e8400-e29b-41d4-a716-446655440000",
      5,
    );

    expect(result.success).toBe(true);
  });
});

// ──────────────────────────────────────────────
// approveReview (admin)
// ──────────────────────────────────────────────

describe("approveReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approves a pending review as admin", async () => {
    mockAuth.mockResolvedValue(authenticatedAdmin);
    mockFindUnique.mockResolvedValue({
      id: "review-1",
      status: "PENDING",
      userId: "user-1",
    });
    mockUpdate.mockResolvedValue({ id: "review-1", status: "APPROVED" });

    const result = await approveReview("review-1");

    expect(result.success).toBe(true);
  });

  it("denies approval when user has customer role", async () => {
    mockAuth.mockResolvedValue(authenticatedCustomer);

    // redirect() throws an error, caught by approveReview's catch block
    const result = await approveReview("review-1");

    expect(result.success).toBe(false);
  });

  it("returns error when review does not exist", async () => {
    mockAuth.mockResolvedValue(authenticatedAdmin);
    mockFindUnique.mockResolvedValue(null);

    const result = await approveReview("nonexistent-review");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("no encontrada");
    }
  });

  it("returns error when review is already approved", async () => {
    mockAuth.mockResolvedValue(authenticatedAdmin);
    mockFindUnique.mockResolvedValue({
      id: "review-1",
      status: "APPROVED",
      userId: "user-1",
    });

    const result = await approveReview("review-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("ya está");
    }
  });

  it("returns error for empty review ID", async () => {
    mockAuth.mockResolvedValue(authenticatedAdmin);

    const result = await approveReview("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("inválido");
    }
  });
});
