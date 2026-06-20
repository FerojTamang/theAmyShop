import { apiClient } from "../lib/apiClient";
import type { ApiResponse, PaginatedMeta, QueryParams } from "../types/api";

export type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN" | "DELETED";

export type ReviewUser = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string;
  role?: string;
  status?: string;
};

export type ReviewProduct = {
  id: string;
  name: string;
  slug: string;
};

export type ReviewOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  createdAt: string;
};

export type ProductReview = {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser | null;
  product?: ReviewProduct | null;
  order?: ReviewOrder | null;
};

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

export type ReviewListResult = {
  reviews: ProductReview[];
  meta: PaginatedMeta;
};

export type ProductReviewListResult = ReviewListResult & {
  summary: ReviewSummary;
};

export type CreateReviewPayload = {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewStatusPayload = {
  status: ReviewStatus;
};

export const reviewApi = {
  async listProductReviews(productId: string, params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<ProductReviewListResult>>(
      `/api/products/${productId}/reviews`,
      { params },
    );
    return response.data.data;
  },
  async create(payload: CreateReviewPayload) {
    const response = await apiClient.post<ApiResponse<{ review: ProductReview }>>(
      "/api/reviews",
      payload,
    );
    return response.data.data.review;
  },
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<ReviewListResult>>(
      "/api/reviews/my",
      { params },
    );
    return response.data.data;
  },
  async listAdmin(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<ReviewListResult>>(
      "/api/admin/reviews",
      { params },
    );
    return response.data.data;
  },
  async getAdmin(id: string) {
    const response = await apiClient.get<ApiResponse<{ review: ProductReview }>>(
      `/api/admin/reviews/${id}`,
    );
    return response.data.data.review;
  },
  async updateAdminStatus(id: string, payload: UpdateReviewStatusPayload) {
    const response = await apiClient.patch<ApiResponse<{ review: ProductReview }>>(
      `/api/admin/reviews/${id}/status`,
      payload,
    );
    return response.data.data.review;
  },
};
