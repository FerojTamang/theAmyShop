import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";
import type { AuthResult, AuthTokens, AuthUser } from "../types/auth";

type LoginPayload = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  referralCode?: string;
};

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<AuthResult>>(
      "/api/auth/login",
      payload,
    );
    return response.data.data;
  },
  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiResponse<AuthResult>>(
      "/api/auth/register",
      payload,
    );
    return response.data.data;
  },
  async me() {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>(
      "/api/auth/me",
    );
    return response.data.data.user;
  },
  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<ApiResponse<{ tokens: AuthTokens }>>(
      "/api/auth/refresh-token",
      { refreshToken },
    );
    return response.data.data.tokens;
  },
  async logout() {
    await apiClient.post("/api/auth/logout");
  },
};
