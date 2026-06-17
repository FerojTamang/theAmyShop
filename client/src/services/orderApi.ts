import { apiClient } from "../lib/apiClient";
import type { ApiResponse, PaginatedMeta, QueryParams } from "../types/api";

export type OrderAddress = {
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

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  customizationRequestId?: string | null;
  productNameSnapshot: string;
  priceSnapshot: string | number;
  quantity: number;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type CustomerOrder = {
  id: string;
  userId: string;
  addressId: string;
  orderNumber: string;
  subtotal: string | number;
  couponDiscount: string | number;
  gemsDiscount: string | number;
  customizationFee: string | number;
  giftWrapFee: string | number;
  shippingFee: string | number;
  totalAmount: string | number;
  paymentMethod: "CASH_ON_DELIVERY" | "KHALTI" | "ESEWA";
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  address?: OrderAddress | null;
  items?: OrderItem[];
  giftOption?: {
    receiverName: string;
    senderName: string;
    giftMessage: string;
    giftWrapRequired: boolean;
    giftWrapFee: string | number;
  } | null;
  payment?: unknown;
  user?: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string;
  } | null;
  statusHistory?: Array<{
    id: string;
    orderId: string;
    oldStatus?: string | null;
    newStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: {
      id: string;
      fullName: string;
      email: string | null;
      phone: string;
      role: string;
    } | null;
  }>;
};

export type OrderListResult = {
  orders: CustomerOrder[];
  meta: PaginatedMeta;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "IN_PRODUCTION"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type UpdateOrderStatusPayload = {
  orderStatus: OrderStatus;
  note?: string;
};

export const orderApi = {
  async listMine(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<OrderListResult>>("/api/orders/my", {
      params,
    });
    return response.data.data;
  },
  async getMine(id: string) {
    const response = await apiClient.get<ApiResponse<{ order: CustomerOrder }>>(
      `/api/orders/${id}`,
    );
    return response.data.data.order;
  },
  async listAdmin(params?: QueryParams) {
    const response = await apiClient.get<ApiResponse<OrderListResult>>(
      "/api/admin/orders",
      { params },
    );
    return response.data.data;
  },
  async getAdmin(id: string) {
    const response = await apiClient.get<ApiResponse<{ order: CustomerOrder }>>(
      `/api/admin/orders/${id}`,
    );
    return response.data.data.order;
  },
  async updateAdminStatus(id: string, payload: UpdateOrderStatusPayload) {
    const response = await apiClient.patch<ApiResponse<{ order: CustomerOrder }>>(
      `/api/admin/orders/${id}/status`,
      payload,
    );
    return response.data.data.order;
  },
};
