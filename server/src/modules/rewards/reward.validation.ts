import { RewardTransactionType } from "../../../generated/prisma/client.js";
import { z } from "zod";

export const rewardTransactionQuerySchema = z.object({
  userId: z.string().trim().optional(),
  orderId: z.string().trim().optional(),
  type: z.nativeEnum(RewardTransactionType).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const rewardWalletQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adjustRewardSchema = z.object({
  userId: z.string().trim().min(1, "User is required"),
  gems: z.coerce
    .number()
    .int("Gems must be an integer")
    .refine((value) => value !== 0, "Gems cannot be zero"),
  description: z
    .string()
    .trim()
    .min(3, "Description is required")
    .max(500, "Description is too long"),
});

export type RewardTransactionQueryInput = z.infer<
  typeof rewardTransactionQuerySchema
>;
export type RewardWalletQueryInput = z.infer<typeof rewardWalletQuerySchema>;
export type AdjustRewardInput = z.infer<typeof adjustRewardSchema>;
