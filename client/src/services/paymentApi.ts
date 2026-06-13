import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const paymentApi = {
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/payments/my",
      { params },
    );
    return response.data.data;
  },
};
