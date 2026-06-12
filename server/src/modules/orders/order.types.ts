import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/client.js";

export type OrderQueryFilters = {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  page: number;
  limit: number;
};
