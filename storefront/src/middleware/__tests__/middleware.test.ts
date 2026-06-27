import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks using vi.hoisted to handle hoisting ──

const { mockNextResponseNext, mockNextResponseRedirect } = vi.hoisted(() => ({
  mockNextResponseNext: vi.fn(() => "next-called" as const),
  mockNextResponseRedirect: vi.fn(() => "redirect-called" as const),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: () => mockNextResponseNext(),
    redirect: (url: URL) => mockNextResponseRedirect(url),
  },
}));

const { mockAuthHandler } = vi.hoisted(() => ({
  mockAuthHandler: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: (handler: unknown) => {
    mockAuthHandler();
    return handler;
  },
}));

// Import the module under test
import middleware from "@/middleware";

describe("Middleware RBAC", () => {
  function createRequest(url: string, auth?: { user?: { role: string } }) {
    return {
      nextUrl: new URL(url, "http://localhost:3000"),
      auth: auth ?? null,
      url,
    } as never;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Admin routes ──

  describe("/admin/* routes", () => {
    it("redirects guest to login when accessing /admin", () => {
      const req = createRequest("http://localhost:3000/admin");

      const result = middleware(req);

      expect(result).toBe("redirect-called");
      expect(mockNextResponseRedirect).toHaveBeenCalled();
    });

    it("redirects guest to login when accessing /admin/dashboard", () => {
      const req = createRequest("http://localhost:3000/admin/dashboard");

      const result = middleware(req);

      expect(result).toBe("redirect-called");
    });

    it("redirects customer to /?error=unauthorized when accessing /admin", () => {
      const req = createRequest("http://localhost:3000/admin", {
        user: { role: "CUSTOMER" },
      });

      const result = middleware(req);

      expect(result).toBe("redirect-called");
    });

    it("allows admin to access /admin", () => {
      const req = createRequest("http://localhost:3000/admin", {
        user: { role: "ADMIN" },
      });

      const result = middleware(req);

      expect(result).toBe("next-called");
      expect(mockNextResponseNext).toHaveBeenCalled();
    });

    it("allows super admin to access /admin", () => {
      const req = createRequest("http://localhost:3000/admin/dashboard", {
        user: { role: "SUPER_ADMIN" },
      });

      const result = middleware(req);

      expect(result).toBe("next-called");
    });
  });

  // ── Account routes ──

  describe("/cuenta/* routes", () => {
    it("redirects guest to login when accessing /cuenta/favoritos", () => {
      const req = createRequest("http://localhost:3000/cuenta/favoritos");

      const result = middleware(req);

      expect(result).toBe("redirect-called");
    });

    it("allows customer to access /cuenta", () => {
      const req = createRequest("http://localhost:3000/cuenta", {
        user: { role: "CUSTOMER" },
      });

      const result = middleware(req);

      expect(result).toBe("next-called");
    });

    it("allows admin to access /cuenta", () => {
      const req = createRequest("http://localhost:3000/cuenta/pedidos", {
        user: { role: "ADMIN" },
      });

      const result = middleware(req);

      expect(result).toBe("next-called");
    });
  });

  // ── Public routes ──

  describe("public routes", () => {
    it("allows guest to access /", () => {
      const req = createRequest("http://localhost:3000/");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });

    it("allows guest to access /productos", () => {
      const req = createRequest("http://localhost:3000/productos");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });

    it("allows guest to access /productos/camiseta-ejemplo", () => {
      const req = createRequest("http://localhost:3000/productos/camiseta-ejemplo");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });
  });

  // ── Static / API routes ──

  describe("internal routes", () => {
    it("allows access to _next routes", () => {
      const req = createRequest("http://localhost:3000/_next/static/chunk.js");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });

    it("allows access to /api routes", () => {
      const req = createRequest("http://localhost:3000/api/auth/session");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });

    it("allows access to /images", () => {
      const req = createRequest("http://localhost:3000/images/logo.png");

      const result = middleware(req);

      expect(result).toBe("next-called");
    });
  });
});
