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
};

export type OrderListResult = {
  orders: CustomerOrder[];
  meta: PaginatedMeta;
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
};
