"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/wishlist/use-wishlist";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({
  productId,
  className = "",
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isWishlisted, toggleItem } = useWishlist();

  const wishlisted = isWishlisted(productId);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      await toggleItem(productId);
    },
    [session, productId, router, toggleItem],
  );

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full p-1.5 transition hover:bg-soft ${className}`}
      aria-label={
        wishlisted
          ? "Quitar de favoritos"
          : "Añadir a favoritos"
      }
      title={
        !session?.user
          ? "Inicia sesión para guardar"
          : wishlisted
            ? "Quitar de favoritos"
            : "Añadir a favoritos"
      }
    >
      <svg
        className={`h-5 w-5 ${
          wishlisted
            ? "fill-red-500 text-red-500"
            : "fill-none text-brand-400 hover:text-red-400"
        }`}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
