import { apiClient } from "../lib/apiClient";
import type { ApiResponse, PaginatedMeta, QueryParams } from "../types/api";

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  productStory?: string | null;
  material?: string | null;
  careInstructions?: string | null;
  makingTime?: string | null;
  price: string | number;
  compareAtPrice?: string | number | null;
  stock: number;
  stockType?: StockType;
  isCustomizable: boolean;
  isGiftSupported: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
  images?: ProductImage[];
};

export type ProductListResult = {
  products: PublicProduct[];
  meta: PaginatedMeta;
};

export type StockType =
  | "READY_STOCK"
  | "MADE_TO_ORDER"
  | "PRE_ORDER"
  | "OUT_OF_STOCK";

export type ProductImagePayload = {
  imageUrl: string;
  publicId: string;
  isPrimary?: boolean;
};

export type ProductPayload = {
  categoryId: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  productStory?: string;
  material?: string;
  careInstructions?: string;
  makingTime?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  stockType?: StockType;
  isCustomizable?: boolean;
  isGiftSupported?: boolean;
  isActive?: boolean;
  images?: ProductImagePayload[];
};

export type ProductUpdatePayload = Partial<ProductPayload>;

export const productApi = {
  async list(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<ProductListResult>>(
      "/api/products",
      {
        params,
      },
    );
    return response.data.data;
  },
  async getBySlug(slug: string) {
    const response = await apiClient.get<ApiResponse<{ product: PublicProduct }>>(
      `/api/products/${slug}`,
    );
    return response.data.data.product;
  },
  async create(payload: ProductPayload) {
    const response = await apiClient.post<ApiResponse<{ product: PublicProduct }>>(
      "/api/admin/products",
      payload,
    );
    return response.data.data.product;
  },
  async update(id: string, payload: ProductUpdatePayload) {
    const response = await apiClient.patch<ApiResponse<{ product: PublicProduct }>>(
      `/api/admin/products/${id}`,
      payload,
    );
    return response.data.data.product;
  },
  async archive(id: string) {
    const response = await apiClient.delete<ApiResponse<{ product: PublicProduct }>>(
      `/api/admin/products/${id}`,
    );
    return response.data.data.product;
  },
};
