import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export type AddressPayload = {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  landmark?: string | null;
  isDefault?: boolean;
};

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  landmark?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export const addressApi = {
  async listMine() {
    const response = await apiClient.get<ApiResponse<{ addresses: Address[] }>>(
      "/api/addresses/my",
    );
    return response.data.data.addresses;
  },
  async create(payload: AddressPayload) {
    const response = await apiClient.post<ApiResponse<{ address: Address }>>(
      "/api/addresses",
      payload,
    );
    return response.data.data.address;
  },
  async update(id: string, payload: Partial<AddressPayload>) {
    const response = await apiClient.patch<ApiResponse<{ address: Address }>>(
      `/api/addresses/${id}`,
      payload,
    );
    return response.data.data.address;
  },
  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<{ address: Address }>>(
      `/api/addresses/${id}`,
    );
    return response.data.data.address;
  },
};
