import {
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/client.js";
import { z } from "zod";

const requiredTextSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const paymentQuerySchema = z.object({
  provider: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const initiatePaymentSchema = z.object({
  orderId: requiredTextSchema("Order"),
});

export const khaltiVerifyPaymentSchema = z
  .object({
    orderId: requiredTextSchema("Order"),
    pidx: z.string().trim().optional(),
    transactionId: z.string().trim().optional(),
    rawResponse: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => value.pidx || value.transactionId, {
    message: "pidx or transactionId is required",
  });

export const esewaVerifyPaymentSchema = z
  .object({
    orderId: requiredTextSchema("Order"),
    transactionCode: z.string().trim().optional(),
    transactionId: z.string().trim().optional(),
    rawResponse: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => value.transactionCode || value.transactionId, {
    message: "transactionCode or transactionId is required",
  });

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  rawResponse: z.record(z.string(), z.unknown()).optional(),
});

export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type KhaltiVerifyPaymentInput = z.infer<
  typeof khaltiVerifyPaymentSchema
>;
export type EsewaVerifyPaymentInput = z.infer<typeof esewaVerifyPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
