import { apiClient } from "../lib/apiClient";
import type { ApiResponse } from "../types/api";

type CheckoutGiftPayload = {
  receiverName?: string;
  senderName?: string;
  giftMessage?: string;
  giftWrapRequired?: boolean;
  giftWrapFee?: number;
};

type CheckoutPayload = {
  addressId: string;
  paymentMethod: "CASH_ON_DELIVERY";
  couponCode?: string;
  shippingFee?: number;
  gift?: CheckoutGiftPayload;
};

export const checkoutApi = {
  async createOrder(payload: CheckoutPayload) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/api/checkout",
      payload,
    );
    return response.data.data;
  },
};
