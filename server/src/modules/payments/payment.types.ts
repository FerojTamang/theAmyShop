import type {
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/client.js";

export type PaymentGateway = Extract<PaymentMethod, "KHALTI" | "ESEWA">;

export type PaymentListFilters = {
  provider?: PaymentMethod;
  status?: PaymentStatus;
  search?: string;
  page: number;
  limit: number;
};

export type PaymentInitiationResult = {
  payment: unknown;
  gateway: PaymentGateway;
  configured: boolean;
  message: string;
};
