import { AccountStatus } from "../../../generated/prisma/client.js";
import { z } from "zod";

export const customerQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateCustomerStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type UpdateCustomerStatusInput = z.infer<
  typeof updateCustomerStatusSchema
>;
