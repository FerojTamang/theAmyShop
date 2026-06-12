export type CheckoutGiftInput = {
  receiverName: string;
  senderName: string;
  giftMessage: string;
  giftWrapRequired: boolean;
  giftWrapFee: number;
};

export type CheckoutOrderInput = {
  addressId: string;
  paymentMethod: "CASH_ON_DELIVERY";
  couponCode?: string;
  shippingFee: number;
  gift?: CheckoutGiftInput;
};
