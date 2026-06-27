"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getProductReviews,
  submitReview,
} from "@/lib/reviews/actions";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ReviewUser {
  name: string | null;
  image: string | null;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

// ──────────────────────────────────────────────
// StarDisplay — renders 1-5 stars
// ──────────────────────────────────────────────

function StarDisplay({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "text-yellow-400"
              : "text-gray-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// ReviewSummary
// ──────────────────────────────────────────────

function ReviewSummary({
  averageRating,
  totalReviews,
  distribution,
}: {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Reseñas de clientes
      </h3>

      <div className="flex items-start gap-6">
        {/* Average score */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </span>
          <StarDisplay rating={Math.round(averageRating)} size="md" />
          <span className="mt-1 text-sm text-gray-500">
            {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}
          </span>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = distribution[star] ?? 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-gray-600">{star}</span>
                <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gray-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ReviewItem
// ──────────────────────────────────────────────

function ReviewItem({ review }: { review: ReviewData }) {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {review.user.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {review.user.name ?? "Usuario"}
          </p>
          <div className="flex items-center gap-2">
            <StarDisplay rating={review.rating} />
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// ReviewForm
// ──────────────────────────────────────────────

function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const { data: session } = useSession();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) {
        setError("Seleccioná una puntuación");
        return;
      }
      if (!session?.user) {
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const result = await submitReview(
        productId,
        rating,
        comment.trim() || undefined,
      );

      if (result.success) {
        setSuccess(true);
        setRating(0);
        setComment("");
        onSubmitted();
      } else {
        setError(result.error);
      }

      setIsSubmitting(false);
    },
    [productId, rating, comment, session, onSubmitted],
  );

  if (!session?.user) return null;

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ¡Gracias por tu reseña! Será visible una vez que un administrador la apruebe.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="mb-4 font-semibold text-gray-900">Dejá tu reseña</h4>

      {/* Star selector */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Puntuación</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition hover:scale-110"
            >
              <svg
                className={`h-7 w-7 ${
                  star <= (hoveredStar || rating)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              {rating === 1 && "Malo"}
              {rating === 2 && "Regular"}
              {rating === 3 && "Bueno"}
              {rating === 4 && "Muy bueno"}
              {rating === 5 && "Excelente"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Comentario{" "}
          <span className="text-gray-400">(opcional, mínimo 10 caracteres)</span>
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Contá tu experiencia con el producto..."
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/1000
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSubmitting ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  );
}

// ──────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            page === currentPage
              ? "bg-primary-500 text-white"
              : "border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// ReviewsSection — main exported component
// ──────────────────────────────────────────────

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 5;

  const loadReviews = useCallback(async (p: number) => {
    setIsLoading(true);
    const result = await getProductReviews(productId, p, pageSize);
    if (result.success) {
      setReviews(result.reviews);
      setTotal(result.total);
      setAverageRating(result.averageRating);
      setDistribution(result.distribution);
    }
    setIsLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews(page);
  }, [page, loadReviews]);

  const handleReviewSubmitted = useCallback(() => {
    // Reload reviews to show the new pending one (won't appear until approved)
    // But we reload to update the count
    loadReviews(page);
  }, [loadReviews, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-12 space-y-8">
      <ReviewSummary
        averageRating={averageRating}
        totalReviews={total}
        distribution={distribution}
      />

      {/* Review form - only show if user might be eligible */}
      <ReviewForm
        productId={productId}
        onSubmitted={handleReviewSubmitted}
      />

      {/* Review list */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Opiniones
          {total > 0 && (
            <span className="ml-2 font-normal text-gray-500">
              ({total} {total === 1 ? "opinión" : "opiniones"})
            </span>
          )}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="h-8 w-8 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            No hay reseñas todavía. ¡Sé el primero en opinar!
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
