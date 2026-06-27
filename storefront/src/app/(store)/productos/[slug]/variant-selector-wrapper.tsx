"use client";

import { useState, useCallback, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import VariantSelector from "@/components/pdp/VariantSelector";
import AddToCartButton from "@/components/pdp/AddToCartButton";
import WishlistButton from "@/components/pdp/WishlistButton";
import SizeGuideModal from "@/components/size-guide/SizeGuideModal";

interface Variant {
  id: string;
  sku: string;
  title: string;
  inventoryQuantity: number;
  allowBackorder?: boolean;
  options: { name: string; value: string }[];
  prices: { amount: number; currencyCode: string }[];
}

interface VariantSelectorWrapperProps {
  variants: Variant[];
  productId: string;
  productTitle?: string;
  productImage?: string;
}

function VariantSelectorInner({
  variants,
  productId,
  productTitle = "",
  productImage,
}: VariantSelectorWrapperProps) {
  const defaultVariant =
    variants.find((v) => v.inventoryQuantity > 0) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariant?.id ?? null,
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  );

  const handleSelectVariant = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
  }, []);

  const handleOpenSizeGuide = useCallback(() => {
    setSizeGuideOpen(true);
  }, []);

  const handleCloseSizeGuide = useCallback(() => {
    setSizeGuideOpen(false);
  }, []);

  return (
    <SessionProvider>
      <VariantSelector
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelectVariant={handleSelectVariant}
        onOpenSizeGuide={handleOpenSizeGuide}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <div className="flex-1">
          <AddToCartButton
            variantId={selectedVariant?.id ?? null}
            productId={productId}
            name={productTitle}
            size={selectedVariant?.title ?? ""}
            price={selectedVariant?.prices[0]?.amount ?? 0}
            image={productImage}
            maxQuantity={selectedVariant?.inventoryQuantity ?? 0}
            disabled={!selectedVariant || selectedVariant.inventoryQuantity === 0}
          />
        </div>
        <WishlistButton productId={productId} variantId={selectedVariantId} />
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={handleCloseSizeGuide}
      />
    </SessionProvider>
  );
}

export default function VariantSelectorWrapper(props: VariantSelectorWrapperProps) {
  return <VariantSelectorInner {...props} />;
}
