import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import type { ApiResponse } from "../types/api";
import type { AuthTokens } from "../types/auth";
import { authStorage } from "./authStorage";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshExcludedPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh-token",
  "/api/auth/logout",
]);

let refreshPromise: Promise<AuthTokens> | null = null;

const isRefreshExcluded = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  const path = url.split("?")[0];
  return [...refreshExcludedPaths].some((excludedPath) =>
    path.endsWith(excludedPath),
  );
};

const refreshSession = (refreshToken: string): Promise<AuthTokens> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiResponse<{ tokens: AuthTokens }>>("/api/auth/refresh-token", {
        refreshToken,
      })
      .then((response) => {
        const nextTokens = response.data.data.tokens;
        authStorage.setTokens(nextTokens);
        return nextTokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const tokens = authStorage.getTokens();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshExcluded(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const storedTokens = authStorage.getTokens();

    if (!storedTokens?.refreshToken) {
      authStorage.clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextTokens = await refreshSession(storedTokens.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${nextTokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      authStorage.clearTokens();
      return Promise.reject(refreshError);
    }
  },
);
