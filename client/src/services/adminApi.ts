import { apiClient } from "../lib/apiClient";
import type { ApiResponse, QueryParams } from "../types/api";

export type AdminDashboardSummary = {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingReviews: number;
  lowStockProducts: number;
  todayOrders: number;
  todayRevenue: number;
};

export type AdminDashboardOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
  };
};

export type AdminLowStockProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  stockType: string;
  isActive: boolean;
  category: { name: string; slug: string } | null;
  primaryImage: { imageUrl: string } | null;
};

export type AdminSalesPoint = {
  date: string;
  orderCount: number;
  revenue: number;
};

export type AdminReviewSummary = {
  statuses: Array<{ status: string; count: number }>;
  averageRating: number;
  reviewCount: number;
};

export const adminApi = {
  dashboard: {
    async summary() {
      const response = await apiClient.get<ApiResponse<{ summary: AdminDashboardSummary }>>(
        "/api/admin/dashboard/summary",
      );
      return response.data.data;
    },
    async recentOrders(limit = 5) {
      const response = await apiClient.get<ApiResponse<{ orders: AdminDashboardOrder[] }>>(
        "/api/admin/dashboard/recent-orders",
        { params: { limit } },
      );
      return response.data.data;
    },
    async lowStock(limit = 5) {
      const response = await apiClient.get<
        ApiResponse<{ threshold: number; products: AdminLowStockProduct[] }>
      >("/api/admin/dashboard/low-stock-products", { params: { limit } });
      return response.data.data;
    },
    async salesOverview(days = 7) {
      const response = await apiClient.get<
        ApiResponse<{ from: string; to: string; sales: AdminSalesPoint[] }>
      >("/api/admin/dashboard/sales-overview", { params: { days } });
      return response.data.data;
    },
    async reviewSummary() {
      const response = await apiClient.get<ApiResponse<AdminReviewSummary>>(
        "/api/admin/dashboard/review-summary",
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
