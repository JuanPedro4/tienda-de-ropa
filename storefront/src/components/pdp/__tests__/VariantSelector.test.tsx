import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VariantSelector from "@/components/pdp/VariantSelector";

const baseVariants = [
  {
    id: "v-80",
    sku: "BOD-001-80",
    title: "80",
    inventoryQuantity: 5,
    allowBackorder: false,
    options: [
      { name: "Talle", value: "80" },
      { name: "Color", value: "Blanco" },
    ],
    prices: [{ amount: 1999, currencyCode: "EUR" }],
  },
  {
    id: "v-86",
    sku: "BOD-001-86",
    title: "86",
    inventoryQuantity: 3,
    allowBackorder: false,
    options: [
      { name: "Talle", value: "86" },
      { name: "Color", value: "Blanco" },
    ],
    prices: [{ amount: 1999, currencyCode: "EUR" }],
  },
  {
    id: "v-92",
    sku: "BOD-001-92",
    title: "92",
    inventoryQuantity: 0,
    allowBackorder: false,
    options: [
      { name: "Talle", value: "92" },
      { name: "Color", value: "Blanco" },
    ],
    prices: [{ amount: 2199, currencyCode: "EUR" }],
  },
];

describe("VariantSelector", () => {
  const onSelectVariant = vi.fn();
  const onOpenSizeGuide = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all size options", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId={null}
        onSelectVariant={onSelectVariant}
      />,
    );

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("86")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("marks the selected variant as active", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId="v-86"
        onSelectVariant={onSelectVariant}
      />,
    );

    const sizeButton = screen.getByText("86");
    expect(sizeButton.className).toContain("border-primary-500");
  });

  it("calls onSelectVariant when a size is clicked", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId={null}
        onSelectVariant={onSelectVariant}
      />,
    );

    fireEvent.click(screen.getByText("80"));
    expect(onSelectVariant).toHaveBeenCalledWith("v-80");
  });

  it("displays out-of-stock variant with a strikethrough style", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId={null}
        onSelectVariant={onSelectVariant}
      />,
    );

    // 92 has inventoryQuantity 0 and no backorder
    const outOfStock = screen.getByText("92");
    // Out of stock items are rendered as <span> with cursor-not-allowed class
    expect(outOfStock.className).toContain("cursor-not-allowed");
  });

  it("shows the price and stock badge for the selected variant", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId="v-80"
        onSelectVariant={onSelectVariant}
      />,
    );

    // Price for variant 80 is 1999 cents = €19.99
    expect(screen.getByText("19,99 €")).toBeInTheDocument();
    // Stock badge for 5 units
    expect(screen.getByText("En stock")).toBeInTheDocument();
  });

  it("shows the size guide button and calls onOpenSizeGuide when clicked", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId={null}
        onSelectVariant={onSelectVariant}
        onOpenSizeGuide={onOpenSizeGuide}
      />,
    );

    const guideBtn = screen.getByText("Guía de talles");
    expect(guideBtn).toBeInTheDocument();
    fireEvent.click(guideBtn);
    expect(onOpenSizeGuide).toHaveBeenCalledOnce();
  });

  describe("color selection", () => {
    const variantsWithColors = [
      {
        id: "v-blanco-80",
        sku: "BOD-002-B-80",
        title: "80",
        inventoryQuantity: 5,
        allowBackorder: false,
        options: [
          { name: "Talle", value: "80" },
          { name: "Color", value: "Blanco" },
        ],
        prices: [{ amount: 1999, currencyCode: "EUR" }],
      },
      {
        id: "v-azul-80",
        sku: "BOD-002-A-80",
        title: "80",
        inventoryQuantity: 3,
        allowBackorder: false,
        options: [
          { name: "Talle", value: "80" },
          { name: "Color", value: "Azul" },
        ],
        prices: [{ amount: 1999, currencyCode: "EUR" }],
      },
    ];

    it("renders color options when variants have colors", () => {
      render(
        <VariantSelector
          variants={variantsWithColors}
          selectedVariantId={null}
          onSelectVariant={onSelectVariant}
        />,
      );

      expect(screen.getByText("Blanco")).toBeInTheDocument();
      expect(screen.getByText("Azul")).toBeInTheDocument();
    });

    it("calls onSelectVariant when a color is clicked", () => {
      render(
        <VariantSelector
          variants={variantsWithColors}
          selectedVariantId={null}
          onSelectVariant={onSelectVariant}
        />,
      );

      fireEvent.click(screen.getByText("Azul"));
      expect(onSelectVariant).toHaveBeenCalledWith("v-azul-80");
    });

    it("does not show color section when all variants have the same color", () => {
      render(
        <VariantSelector
          variants={baseVariants}
          selectedVariantId={null}
          onSelectVariant={onSelectVariant}
        />,
      );

      // All variants are "Blanco" (same color) — only one color option exists
      // VariantSelector only shows the color section when there are >1 colors
      // The label "Color" should not be rendered
      expect(screen.queryByText("Color")).not.toBeInTheDocument();
    });
  });

  it("does not render price section when no variant is selected", () => {
    render(
      <VariantSelector
        variants={baseVariants}
        selectedVariantId={null}
        onSelectVariant={onSelectVariant}
      />,
    );

    // No price should show
    expect(screen.queryByText("19,99 €")).not.toBeInTheDocument();
  });
});
