import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export type CartProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: string;
};

export type CartProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  stock: number;
  stockType: string;
  isCustomizable: boolean;
  isGiftSupported: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  images?: CartProductImage[];
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  customizationRequestId?: string | null;
  quantity: number;
  priceSnapshot: string;
  lineTotal: string;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
};

export type CartSummary = {
  totalItems: number;
  subtotal: string;
};

export type CartResult = {
  cart: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    items: CartItem[];
  };
  summary: CartSummary;
};

export const cartApi = {
  async get() {
    const response = await apiClient.get<ApiResponse<CartResult>>("/api/cart");
    return response.data.data;
  },
  async addItem(productId: string, quantity: number) {
    const response = await apiClient.post<ApiResponse<CartResult>>(
      "/api/cart/items",
      { productId, quantity },
    );
    return response.data.data;
  },
  async updateItem(id: string, quantity: number) {
    const response = await apiClient.patch<ApiResponse<CartResult>>(
      `/api/cart/items/${id}`,
      { quantity },
    );
    return response.data.data;
  },
  async removeItem(id: string) {
    const response = await apiClient.delete<ApiResponse<CartResult>>(
      `/api/cart/items/${id}`,
    );
    return response.data.data;
  },
  async clear() {
    const response = await apiClient.delete<ApiResponse<CartResult>>("/api/cart");
    return response.data.data;
  },
};
