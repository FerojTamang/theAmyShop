import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const referralApi = {
  async code() {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/referrals/code",
    );
    return response.data.data;
  },
  async apply(code: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/api/referrals/apply",
      { code },
    );
    return response.data.data;
  },
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/referrals/my",
      { params },
    );
    return response.data.data;
  },
};
