import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const productApi = {
  async list(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/products", {
      params,
    });
    return response.data.data;
  },
  async getBySlug(slug: string) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/products/${slug}`,
    );
    return response.data.data;
  },
};
