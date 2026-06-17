import { apiClient } from "../lib/apiClient";
import type { ApiResponse, PaginatedMeta, QueryParams } from "../types/api";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type AdminCustomerProfile = {
  id: string;
  userId: string;
  profileImage?: string | null;
  totalOrders: number;
  totalSpent: string | number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  role: string;
  status: CustomerStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: AdminCustomerProfile | null;
  _count?: {
    addresses?: number;
    orders?: number;
    reviews?: number;
    referralsMade?: number;
    rewardTransactions?: number;
  };
};

export type AdminCustomerAddress = {
  id: string;
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

export type AdminCustomerRecentOrder = {
  id: string;
  orderNumber: string;
  totalAmount: string | number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

export type AdminCustomerDetail = AdminCustomer & {
  addresses?: AdminCustomerAddress[];
  orders?: AdminCustomerRecentOrder[];
  rewardWallet?: {
    id: string;
    balance: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  } | null;
  referralCode?: {
    id: string;
    code: string;
    totalReferrals: number;
    successfulReferrals: number;
    isActive: boolean;
  } | null;
};

export type AdminCustomerListResult = {
  customers: AdminCustomer[];
  meta: PaginatedMeta;
};

export type AdminCustomerDetailResult = {
  customer: AdminCustomerDetail;
  summaries?: {
    orders?: {
      totalOrders: number;
      totalSpent: string | number;
      recentOrders?: AdminCustomerRecentOrder[];
    };
    rewards?: AdminCustomerDetail["rewardWallet"];
    referrals?: {
      code?: AdminCustomerDetail["referralCode"];
      madeCount?: number;
    };
  };
};

export const adminCustomerApi = {
  async list(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<AdminCustomerListResult>>(
      "/api/admin/customers",
      { params },
    );
    return response.data.data;
  },
  async get(id: string) {
    const response = await apiClient.get<ApiResponse<AdminCustomerDetailResult>>(
      `/api/admin/customers/${id}`,
    );
    return response.data.data;
  },
  async updateStatus(id: string, status: CustomerStatus) {
    const response = await apiClient.patch<ApiResponse<{ customer: AdminCustomer }>>(
      `/api/admin/customers/${id}/status`,
      { status },
    );
    return response.data.data.customer;
  },
};
