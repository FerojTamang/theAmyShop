import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

export type CheckoutGiftPayload = {
  receiverName?: string;
  senderName?: string;
  giftMessage?: string;
  giftWrapRequired?: boolean;
};

export type CheckoutPayload = {
  addressId: string;
  paymentMethod: "CASH_ON_DELIVERY";
  couponCode?: string;
  gift?: CheckoutGiftPayload;
};

export type CheckoutOrder = {
  id: string;
  orderNumber: string;
  subtotal: string | number;
  couponDiscount: string | number;
  gemsDiscount: string | number;
  customizationFee: string | number;
  giftWrapFee: string | number;
  shippingFee: string | number;
  totalAmount: string | number;
  paymentMethod: "CASH_ON_DELIVERY";
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
};

export const checkoutApi = {
  async createOrder(payload: CheckoutPayload) {
    const response = await apiClient.post<ApiResponse<{ order: CheckoutOrder }>>(
      "/api/checkout",
      payload,
    );
    return response.data.data.order;
  },
};
