import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export type ProductImageUploadResult = {
  imageUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};

export const uploadApi = {
  async uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post<ApiResponse<ProductImageUploadResult>>(
      "/api/admin/uploads/product-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },
};
