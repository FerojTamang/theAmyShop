import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const rewardApi = {
  async wallet() {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/rewards/wallet",
    );
    return response.data.data;
  },
  async transactions(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/api/rewards/transactions",
      { params },
    );
    return response.data.data;
  },
};
