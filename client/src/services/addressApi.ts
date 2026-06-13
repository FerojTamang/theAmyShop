import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export const addressApi = {
  async listMine() {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/addresses/my",
    );
    return response.data.data;
  },
  async create(payload: unknown) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/api/addresses",
      payload,
    );
    return response.data.data;
  },
  async update(id: string, payload: unknown) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/api/addresses/${id}`,
      payload,
    );
    return response.data.data;
  },
};
