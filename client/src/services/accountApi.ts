import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export const accountApi = {
  async profile() {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/account/profile",
    );
    return response.data.data;
  },
  async updateProfile(payload: unknown) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      "/api/account/profile",
      payload,
    );
    return response.data.data;
  },
  async changePassword(payload: unknown) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      "/api/account/change-password",
      payload,
    );
    return response.data.data;
  },
};
