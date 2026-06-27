"use client";

import { SessionProvider } from "next-auth/react";
import ReviewsSection from "@/components/reviews/ReviewsSection";

interface ReviewsWrapperProps {
  productId: string;
}

function ReviewsInner({ productId }: ReviewsWrapperProps) {
  return <ReviewsSection productId={productId} />;
}

export default function ReviewsWrapper({ productId }: ReviewsWrapperProps) {
  return (
    <SessionProvider>
      <ReviewsInner productId={productId} />
    </SessionProvider>
  );
}
