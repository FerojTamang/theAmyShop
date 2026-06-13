import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";
import type { PublicProduct } from "./productApi";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export type PublicCategoryWithProducts = PublicCategory & {
  products: PublicProduct[];
};

export const categoryApi = {
  async list() {
    const response = await apiClient.get<
      ApiResponse<{ categories: PublicCategory[] }>
    >("/api/categories");
    return response.data.data.categories;
  },
  async getBySlug(slug: string) {
    const response = await apiClient.get<
      ApiResponse<{ category: PublicCategoryWithProducts }>
    >(
      `/api/categories/${slug}`,
    );
    return response.data.data.category;
  },
};
