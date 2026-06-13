import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export const categoryApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/categories");
    return response.data.data;
  },
  async getBySlug(slug: string) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/categories/${slug}`,
    );
    return response.data.data;
  },
};
