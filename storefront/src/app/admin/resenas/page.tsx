"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getReviewsByStatus,
  approveReview,
  rejectReview,
} from "@/lib/reviews/actions";
import { getMockProductById } from "@/lib/products/mock-data";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type ReviewTab = "PENDING" | "APPROVED" | "REJECTED";

interface ReviewItem {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
}

const TAB_LABELS: Record<ReviewTab, string> = {
  PENDING: "Pendientes",
  APPROVED: "Aprobadas",
  REJECTED: "Rechazadas",
};

const TAB_COLORS: Record<ReviewTab, string> = {
  PENDING: "border-yellow-400 text-yellow-700",
  APPROVED: "border-green-400 text-green-700",
  REJECTED: "border-red-400 text-red-700",
};

// ──────────────────────────────────────────────
// StarDisplay
// ──────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "text-yellow-400" : "text-gray-200"
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
// ReviewCard
// ──────────────────────────────────────────────

function ReviewCard({
  review,
  onApproved,
  onRejected,
}: {
  review: ReviewItem;
  onApproved: () => void;
  onRejected: () => void;
}) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const product = getMockProductById(review.productId);
  const date = new Date(review.createdAt);

  const handleApprove = useCallback(async () => {
    setIsApproving(true);
    setError(null);
    const result = await approveReview(review.id);
    if (result.success) {
      onApproved();
    } else {
      setError(result.error);
    }
    setIsApproving(false);
  }, [review.id, onApproved]);

  const handleReject = useCallback(async () => {
    setIsRejecting(true);
    setError(null);
    const result = await rejectReview(review.id, rejectReason || undefined);
    if (result.success) {
      setShowRejectForm(false);
      setRejectReason("");
      onRejected();
    } else {
      setError(result.error);
    }
    setIsRejecting(false);
  }, [review.id, rejectReason, onRejected]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {review.user.name ?? "Usuario anónimo"}
          </p>
          <p className="text-xs text-gray-500">{review.user.email ?? ""}</p>
        </div>
        <span className="text-xs text-gray-400">
          {date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Product info */}
      <div className="mb-2 rounded-md bg-gray-50 p-2">
        <p className="text-xs text-gray-500">Producto:</p>
        <p className="text-sm font-medium text-gray-700">
          {product?.title ?? review.productId}
        </p>
      </div>

      {/* Rating */}
      <div className="mb-2 flex items-center gap-2">
        <StarDisplay rating={review.rating} />
        <span className="text-sm font-medium text-gray-700">
          {review.rating}/5
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mb-3 text-sm text-gray-600">{review.comment}</p>
      )}

      {/* Error */}
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}

      {/* Actions (only for pending) */}
      {review.status === "PENDING" && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApproving ? "Aprobando..." : "Aprobar"}
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            disabled={isRejecting}
            className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="mt-3 space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
          <label className="block text-sm font-medium text-gray-700">
            Motivo de rechazo{" "}
            <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Explicá por qué se rechaza esta reseña..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              disabled={isRejecting}
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRejecting ? "Rechazando..." : "Confirmar rechazo"}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Status badge for non-pending */}
      {review.status !== "PENDING" && (
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
            review.status === "APPROVED"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {review.status === "APPROVED" ? "Aprobada" : "Rechazada"}
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("PENDING");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async (tab: ReviewTab) => {
    setIsLoading(true);
    setError(null);
    const result = await getReviewsByStatus(tab);
    if (result.success) {
      setReviews(result.reviews);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadReviews(activeTab);
  }, [activeTab, loadReviews]);

  const handleReviewChanged = useCallback(() => {
    loadReviews(activeTab);
  }, [activeTab, loadReviews]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Moderación de reseñas
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200">
        {(Object.keys(TAB_LABELS) as ReviewTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? `${TAB_COLORS[tab]} border-current`
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="h-8 w-8 animate-spin text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>
            No hay reseñas{" "}
            {TAB_LABELS[activeTab].toLowerCase()} para mostrar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {reviews.length}{" "}
            {reviews.length === 1 ? "reseña" : "reseñas"} en{" "}
            {TAB_LABELS[activeTab].toLowerCase()}
          </p>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApproved={handleReviewChanged}
              onRejected={handleReviewChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
