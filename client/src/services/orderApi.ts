import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const orderApi = {
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/orders/my", {
      params,
    });
    return response.data.data;
  },
  async getMine(id: string) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/orders/${id}`,
    );
    return response.data.data;
  },
};
