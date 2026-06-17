import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";
import type { AccountStatus, UserRole } from "../types/auth";

export type AccountProfile = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    userId: string;
    profileImage: string | null;
    totalOrders: number;
    totalSpent: string | number;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type AccountProfilePayload = {
  fullName?: string;
  phone?: string;
};

export const accountApi = {
  async profile() {
    const response = await apiClient.get<ApiResponse<{ profile: AccountProfile }>>(
      "/api/account/profile",
    );
    return response.data.data.profile;
  },
  async updateProfile(payload: AccountProfilePayload) {
    const response = await apiClient.patch<ApiResponse<{ profile: AccountProfile }>>(
      "/api/account/profile",
      payload,
    );
    return response.data.data.profile;
  },
  async changePassword(payload: unknown) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      "/api/account/change-password",
      payload,
    );
    return response.data.data;
  },
};
