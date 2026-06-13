import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export const cartApi = {
  async get() {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/cart");
    return response.data.data;
  },
  async addItem(productId: string, quantity: number) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/api/cart/items",
      { productId, quantity },
    );
    return response.data.data;
  },
  async updateItem(id: string, quantity: number) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/api/cart/items/${id}`,
      { quantity },
    );
    return response.data.data;
  },
  async removeItem(id: string) {
    const response = await apiClient.delete<ApiResponse<unknown>>(
      `/api/cart/items/${id}`,
    );
    return response.data.data;
  },
  async clear() {
    const response = await apiClient.delete<ApiResponse<unknown>>("/api/cart");
    return response.data.data;
  },
};
