export type OrderTotalInput = {
  subtotal: number;
  couponDiscount?: number;
  gemsDiscount?: number;
  customizationFee?: number;
  giftWrapFee?: number;
  shippingFee?: number;
};

export type OrderTotalResult = Required<OrderTotalInput> & {
  totalAmount: number;
};

export const roundMoney = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const calculateOrderTotal = (
  input: OrderTotalInput,
): OrderTotalResult => {
  const subtotal = roundMoney(input.subtotal);
  const couponDiscount = roundMoney(input.couponDiscount ?? 0);
  const gemsDiscount = roundMoney(input.gemsDiscount ?? 0);
  const customizationFee = roundMoney(input.customizationFee ?? 0);
  const giftWrapFee = roundMoney(input.giftWrapFee ?? 0);
  const shippingFee = roundMoney(input.shippingFee ?? 0);
  const totalAmount = roundMoney(
    Math.max(
      subtotal +
        customizationFee +
        giftWrapFee +
        shippingFee -
        couponDiscount -
        gemsDiscount,
      0,
    ),
  );

  return {
    subtotal,
    couponDiscount,
    gemsDiscount,
    customizationFee,
    giftWrapFee,
    shippingFee,
    totalAmount,
  };
};
