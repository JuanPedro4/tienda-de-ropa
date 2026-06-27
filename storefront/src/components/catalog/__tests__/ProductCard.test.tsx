import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductCard from "@/components/catalog/ProductCard";

// ── Mocks ──

const mockUseSession = vi.fn();
const mockIsWishlisted = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: (...args: unknown[]) => mockUseSession(...args),
}));

vi.mock("@/lib/wishlist/use-wishlist", () => ({
  useWishlist: () => ({
    isWishlisted: mockIsWishlisted,
    toggleItem: vi.fn(),
    wishlist: [],
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// ── Fixtures ──

const minimalProduct = {
  id: "prod-1",
  title: "Body Manga Larga Algodón",
  handle: "body-manga-larga",
  thumbnail: "https://example.com/img.jpg",
  variants: [
    {
      id: "var-1",
      sku: "BOD-001",
      title: "80",
      prices: [{ amount: 1999, currencyCode: "EUR" }],
      inventoryQuantity: 10,
    },
  ],
  categories: [{ name: "Casual", handle: "casual" }],
};

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: unauthenticated, not wishlisted
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    mockIsWishlisted.mockReturnValue(false);
  });

  it("renders with minimal props", () => {
    render(<ProductCard product={minimalProduct} />);
    expect(screen.getByText("Body Manga Larga Algodón")).toBeInTheDocument();
  });

  it("displays the product category", () => {
    render(<ProductCard product={minimalProduct} />);
    expect(screen.getByText("Casual")).toBeInTheDocument();
  });

  it("displays the product price formatted in EUR", () => {
    render(<ProductCard product={minimalProduct} />);
    // 1999 cents = €19.99 (es-ES formatting)
    expect(screen.getByText("19,99 €")).toBeInTheDocument();
  });

  it("displays the smallest size as 'Desde talle'", () => {
    render(<ProductCard product={minimalProduct} />);
    expect(screen.getByText(/Desde talle/)).toBeInTheDocument();
  });

  it("renders product image with alt text", () => {
    render(<ProductCard product={minimalProduct} />);
    const img = screen.getByAltText("Body Manga Larga Algodón");
    expect(img).toBeInTheDocument();
  });

  it("renders a placeholder SVG when thumbnail is null", () => {
    const noThumb = { ...minimalProduct, thumbnail: null };
    const { container } = render(<ProductCard product={noThumb} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("links to the product PDP page", () => {
    render(<ProductCard product={minimalProduct} />);
    const links = screen.getAllByRole("link", { name: /Body Manga Larga Algodón/ });
    // Both links (image wrapper + title) should point to the PDP
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/productos/body-manga-larga");
    }
  });

  describe("wishlist button", () => {
    it("shows 'Añadir a favoritos' when user is not logged in", () => {
      mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
      render(<ProductCard product={minimalProduct} />);
      expect(screen.getByLabelText("Añadir a favoritos")).toBeInTheDocument();
    });

    it("shows 'Añadir a favoritos' when user is logged in but not wishlisted", () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "u1", role: "CUSTOMER" } },
        status: "authenticated",
      });
      mockIsWishlisted.mockReturnValue(false);
      render(<ProductCard product={minimalProduct} />);
      expect(screen.getByLabelText("Añadir a favoritos")).toBeInTheDocument();
    });

    it("shows 'Quitar de favoritos' when product is wishlisted", () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: "u1", role: "CUSTOMER" } },
        status: "authenticated",
      });
      mockIsWishlisted.mockReturnValue(true);
      render(<ProductCard product={minimalProduct} />);
      expect(screen.getByLabelText("Quitar de favoritos")).toBeInTheDocument();
    });
  });
});
