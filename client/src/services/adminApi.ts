import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export const adminApi = {
  dashboard: {
    async summary() {
      const response = await apiClient.get<ApiResponse<unknown>>(
        "/api/admin/dashboard/summary",
      );
      return response.data.data;
    },
  },
  products: {
    async list(params?: QueryParams) {
      const response = await apiClient.get<ApiResponse<unknown>>(
        "/api/admin/products",
        { params },
      );
      return response.data.data;
    },
  },
  orders: {
    async list(params?: QueryParams) {
      const response = await apiClient.get<ApiResponse<unknown>>(
        "/api/admin/orders",
        { params },
      );
      return response.data.data;
    },
  },
  customers: {
    async list(params?: QueryParams) {
      const response = await apiClient.get<ApiResponse<unknown>>(
        "/api/admin/customers",
        { params },
      );
      return response.data.data;
    },
  },
};
