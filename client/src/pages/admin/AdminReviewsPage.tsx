import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Heart,
  Star,
  X,
} from "lucide-react";
import { normalizeApiError } from "../../lib/apiError";
import {
  reviewApi,
  type ProductReview,
  type ReviewStatus,
} from "../../services/reviewApi";
import type { PaginatedMeta } from "../../types/api";

const reviewStatuses: Array<ReviewStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "HIDDEN",
  "DELETED",
];

const statusOptions: ReviewStatus[] = ["PENDING", "APPROVED", "HIDDEN", "DELETED"];

const statusStyles: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  HIDDEN: "bg-stone-100 text-stone-600 ring-stone-200",
  DELETED: "bg-red-100 text-red-700 ring-red-200",
};

const displayStatus = (status: string) => status.replaceAll("_", " ");

const formatDate = (date: string | undefined) => {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getApiErrorMessage = (error: unknown) => {
  const normalized = normalizeApiError(error);
  const firstError = normalized.errors?.[0];

  if (
    firstError &&
    typeof firstError === "object" &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message;
  }

  return normalized.message;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex text-[#F2B84B]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star className={`h-4 w-4 ${index < rating ? "fill-current" : ""}`} key={index} />
      ))}
    </span>
  );
}

function Badge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[status]}`}>
      {displayStatus(status)}
    </span>
  );
}

function Notice({ message, tone }: { message: string; tone: "error" | "success" }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-600"
    }`}>
      {message}
    </div>
  );
}

function StateCard({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-6 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Star className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-bold text-[#1F1720]">{title}</h3>
      <p className="mt-2 text-sm text-[#6F6570]">{description}</p>
    </div>
  );
}

function ReviewDetailPanel({
  isLoading,
  onClose,
  onStatusChange,
  review,
  updatingReviewId,
}: {
  isLoading: boolean;
  onClose: () => void;
  onStatusChange: (review: ProductReview, status: ReviewStatus) => void;
  review: ProductReview | null;
  updatingReviewId: string | null;
}) {
  return (
    <aside className="border-l border-[#F7D9E2] bg-[#FFF5F7] px-6 py-8 xl:w-[29rem] xl:shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            Review Detail
          </h2>
          <p className="mt-2 text-sm text-[#6F6570]">Review details and moderation status.</p>
        </div>
        <button onClick={onClose} type="button">
          <X className="h-5 w-5 text-[#6F6570]" />
        </button>
      </div>

      {isLoading ? (
        <Panel title="Loading review">
          <p className="text-sm text-[#6F6570]">Fetching review detail.</p>
        </Panel>
      ) : review ? (
        <>
          <Panel title="Review">
            <div className="grid gap-3">
              <Stars rating={review.rating} />
              <Badge status={review.status} />
              <p className="text-sm leading-6 text-[#6F6570]">{review.comment ?? "No written comment provided."}</p>
              <p className="text-xs font-semibold text-[#9D8F98]">Created {formatDate(review.createdAt)}</p>
            </div>
          </Panel>
          <Panel title="Moderation">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-4 py-3">
                <span className="text-sm font-bold text-[#6F6570]">Current status</span>
                <Badge status={review.status} />
              </div>
              <ReviewModerationActions
                isUpdating={updatingReviewId === review.id}
                onStatusChange={(status) => onStatusChange(review, status)}
                reviewStatus={review.status}
              />
            </div>
          </Panel>
          <Panel title="Product">
            <p className="font-bold text-[#1F1720]">{review.product?.name ?? "Unknown product"}</p>
            <p className="mt-1 text-sm text-[#6F6570]">{review.product?.slug ?? "No slug"}</p>
          </Panel>
          <Panel title="Customer">
            <p className="font-bold text-[#1F1720]">{review.user?.fullName ?? "Unknown customer"}</p>
            <p className="mt-1 text-sm text-[#6F6570]">{review.user?.email ?? "No email"}</p>
            <p className="text-sm text-[#6F6570]">{review.user?.phone ?? "No phone"}</p>
          </Panel>
          <Panel title="Order">
            <p className="font-bold text-[#1F1720]">#{review.order?.orderNumber ?? "Not provided"}</p>
            <p className="mt-1 text-sm text-[#6F6570]">{displayStatus(review.order?.orderStatus ?? "UNKNOWN")}</p>
          </Panel>
        </>
      ) : (
        <StateCard title="No review selected" description="Select a review row to view details." />
      )}
    </aside>
  );
}

function ReviewModerationActions({
  isUpdating,
  onStatusChange,
  reviewStatus,
}: {
  isUpdating: boolean;
  onStatusChange: (status: ReviewStatus) => void;
  reviewStatus: ReviewStatus;
}) {
  const actions: Array<{ label: string; status: ReviewStatus; className: string }> = [
    {
      className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      label: "Approve",
      status: "APPROVED",
    },
    {
      className: "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100",
      label: "Hide",
      status: "HIDDEN",
    },
    {
      className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
      label: "Delete",
      status: "DELETED",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          className={`rounded-xl border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}
          disabled={isUpdating || reviewStatus === action.status}
          key={action.status}
          onClick={() => onStatusChange(action.status)}
          type="button"
        >
          {isUpdating ? "Updating..." : action.label}
        </button>
      ))}
    </div>
  );
}

function Panel({
  action,
  children,
  title,
}: {
  action?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-[#1F1720]">{title}</h3>
        {action ? <span className="rounded-full bg-[#FFF5F7] px-3 py-1 text-xs font-bold text-[#C8A7B1]">{action}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [activeStatus, setActiveStatus] = useState<ReviewStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [detailReview, setDetailReview] = useState<ProductReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await reviewApi.listAdmin({
        limit: 20,
        page,
        status: activeStatus === "ALL" ? undefined : activeStatus,
      });
      setReviews(result.reviews);
      setMeta(result.meta);
      setSelectedReview((current) => {
        if (current && result.reviews.some((review) => review.id === current.id)) {
          return result.reviews.find((review) => review.id === current.id) ?? current;
        }

        return result.reviews[0] ?? null;
      });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
      setReviews([]);
      setMeta(null);
      setSelectedReview(null);
      setDetailReview(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, page]);

  const loadReviewDetail = useCallback(async (reviewId: string) => {
    try {
      setIsDetailLoading(true);
      const review = await reviewApi.getAdmin(reviewId);
      setDetailReview(review);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
      setDetailReview(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (selectedReview) {
      void loadReviewDetail(selectedReview.id);
    } else {
      setDetailReview(null);
    }
  }, [loadReviewDetail, selectedReview]);

  const stats = useMemo(() => {
    const counts = statusOptions.reduce<Record<ReviewStatus, number>>((result, status) => {
      result[status] = reviews.filter((review) => review.status === status).length;
      return result;
    }, {
      APPROVED: 0,
      DELETED: 0,
      HIDDEN: 0,
      PENDING: 0,
    });

    return [
      { label: "Total reviews", value: String(meta?.total ?? reviews.length), icon: Star },
      { label: "Visible pending", value: String(counts.PENDING), icon: ClipboardList },
      { label: "Visible approved", value: String(counts.APPROVED), icon: Heart },
      { label: "Visible hidden", value: String(counts.HIDDEN + counts.DELETED), icon: X },
    ];
  }, [meta, reviews]);

  const handleStatusChange = async (review: ProductReview, status: ReviewStatus) => {
    if (status === review.status) {
      return;
    }

    if ((status === "HIDDEN" || status === "DELETED") && !window.confirm(`Mark this review as ${displayStatus(status)}?`)) {
      return;
    }

    try {
      setUpdatingReviewId(review.id);
      setError(null);
      setSuccessMessage(null);
      const updatedReview = await reviewApi.updateAdminStatus(review.id, { status });
      setReviews((current) => current.map((item) => item.id === review.id ? updatedReview : item));
      setSelectedReview((current) => current?.id === review.id ? updatedReview : current);
      setDetailReview((current) => current?.id === review.id ? updatedReview : current);
      setSuccessMessage(`Review status updated to ${displayStatus(status)}.`);
      await loadReviewDetail(updatedReview.id);
      await loadReviews();
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setUpdatingReviewId(null);
    }
  };

  return (
    <div className="min-w-0 bg-white text-[#1F1720]">
      <div className="min-w-0 flex-1">
        <div className="grid min-h-screen xl:grid-cols-[minmax(0,1fr)_29rem]">
          <main className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                    Reviews <Heart className="inline h-5 w-5 text-[#EC4C84]" />
                  </h1>
                  <p className="mt-1 text-sm text-[#6F6570]">Moderate customer product reviews.</p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100" key={stat.label}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#6F6570]">{stat.label}</p>
                          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{stat.value}</p>
                          <p className="mt-1 text-xs font-bold text-[#EC4C84]">Loaded from API</p>
                        </div>
                        <span className="grid h-13 w-13 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3">
                {successMessage ? <Notice message={successMessage} tone="success" /> : null}
                {error ? <Notice message={error} tone="error" /> : null}
              </div>

              <div className="mt-7 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <div>
                  <select
                    className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570] outline-none"
                    onChange={(event) => {
                      setPage(1);
                      setActiveStatus(event.target.value as ReviewStatus | "ALL");
                    }}
                    value={activeStatus}
                  >
                    {reviewStatuses.map((status) => (
                      <option key={status} value={status}>{displayStatus(status)}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 overflow-x-auto">
                  {isLoading ? (
                    <StateCard title="Loading reviews" description="Loading real admin review records." />
                  ) : reviews.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
                      <div className="grid min-w-[88rem] grid-cols-[8rem_1.3fr_1.3fr_7rem_1.7fr_9rem_8rem_20rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
                        <span>Review</span>
                        <span>Product</span>
                        <span>Customer</span>
                        <span>Rating</span>
                        <span>Comment</span>
                        <span>Status</span>
                        <span>Date</span>
                        <span>Actions</span>
                      </div>
                      <div className="min-w-[88rem]">
                        {reviews.map((review) => (
                          <div
                            className={`grid w-full cursor-pointer grid-cols-[8rem_1.3fr_1.3fr_7rem_1.7fr_9rem_8rem_20rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-left text-sm last:border-b-0 ${
                              selectedReview?.id === review.id ? "bg-[#FFF5F7]" : "bg-white"
                            }`}
                            key={review.id}
                            onClick={() => setSelectedReview(review)}
                          >
                            <span className="truncate font-bold text-[#EC4C84]">#{review.id.slice(-6)}</span>
                            <span className="truncate font-bold text-[#1F1720]">{review.product?.name ?? "Unknown product"}</span>
                            <span>
                              <span className="block truncate font-bold text-[#1F1720]">{review.user?.fullName ?? "Unknown customer"}</span>
                              <span className="text-xs text-[#6F6570]">{review.user?.email ?? review.user?.phone ?? "No contact"}</span>
                            </span>
                            <span><Stars rating={review.rating} /></span>
                            <span className="truncate text-xs text-[#6F6570]">{review.comment ?? "No comment"}</span>
                            <span><Badge status={review.status} /></span>
                            <span className="text-xs text-[#6F6570]">{formatDate(review.createdAt)}</span>
                            <span onClick={(event) => event.stopPropagation()}>
                              <ReviewModerationActions
                                isUpdating={updatingReviewId === review.id}
                                onStatusChange={(status) => void handleStatusChange(review, status)}
                                reviewStatus={review.status}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <StateCard
                      title={error ? "Review API unavailable" : "No reviews found"}
                      description={error ? "Refresh the page to try again." : "No reviews match this view."}
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-[#6F6570] sm:flex-row sm:items-center sm:justify-between">
                  <span>{meta ? `Showing page ${meta.page} of ${meta.totalPages || 1} - ${meta.total} total` : "Pagination appears after reviews load."}</span>
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page <= 1 || isLoading}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page >= meta.totalPages || isLoading}
                      onClick={() => setPage((current) => current + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <ReviewDetailPanel
            isLoading={isDetailLoading}
            onClose={() => setSelectedReview(null)}
            onStatusChange={(review, status) => void handleStatusChange(review, status)}
            review={detailReview ?? selectedReview}
            updatingReviewId={updatingReviewId}
          />
        </div>
      </div>
    </div>
  );
}
