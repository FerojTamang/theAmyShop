import { apiClient } from "../lib/apiClient";
import type { ApiResponse, PaginatedMeta, QueryParams } from "../types/api";

export type CouponDiscountType =
  | "PERCENTAGE_DISCOUNT"
  | "FIXED_DISCOUNT"
  | "FREE_SHIPPING"
  | "FREE_GIFT_WRAP";

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: string | number;
  minimumOrderAmount: string | number;
  maximumDiscountAmount?: string | number | null;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponPayload = {
  code?: string;
  title?: string;
  description?: string | null;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export type CouponListResult = {
  coupons: Coupon[];
  meta: PaginatedMeta;
};

export type CouponValidationPayload = {
  code: string;
  orderAmount: number;
  shippingFee?: number;
  giftWrapFee?: number;
};

export type CouponValidationResult = {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  coupon: Coupon | null;
  reason: string | null;
};

export const couponApi = {
  async listAdmin(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<CouponListResult>>(
      "/api/admin/coupons",
      { params },
    );
    return response.data.data;
  },
  async getAdmin(id: string) {
    const response = await apiClient.get<ApiResponse<{ coupon: Coupon }>>(
      `/api/admin/coupons/${id}`,
    );
    return response.data.data.coupon;
  },
  async createAdmin(payload: CouponPayload) {
    const response = await apiClient.post<ApiResponse<{ coupon: Coupon }>>(
      "/api/admin/coupons",
      payload,
    );
    return response.data.data.coupon;
  },
  async updateAdmin(id: string, payload: CouponPayload) {
    const response = await apiClient.patch<ApiResponse<{ coupon: Coupon }>>(
      `/api/admin/coupons/${id}`,
      payload,
    );
    return response.data.data.coupon;
  },
  async deactivateAdmin(id: string) {
    const response = await apiClient.delete<ApiResponse<{ coupon: Coupon }>>(
      `/api/admin/coupons/${id}`,
    );
    return response.data.data.coupon;
  },
  async validate(payload: CouponValidationPayload) {
    const response = await apiClient.post<ApiResponse<CouponValidationResult>>(
      "/api/coupons/validate",
      payload,
    );
    return response.data.data;
  },
};
