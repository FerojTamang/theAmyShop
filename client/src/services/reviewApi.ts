import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const reviewApi = {
  async listProductReviews(productId: string, params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/products/${productId}/reviews`,
      { params },
    );
    return response.data.data;
  },
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/reviews/my", {
      params,
    });
    return response.data.data;
  },
};
