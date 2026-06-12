export type CartItemSummary = {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: string;
  lineTotal: string;
};

export type CartSummary = {
  totalItems: number;
  subtotal: string;
};
