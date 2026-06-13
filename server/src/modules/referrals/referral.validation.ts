import { ReferralStatus } from "../../../generated/prisma/client.js";
import { z } from "zod";

const referralCodeSchema = z
  .string()
  .trim()
  .min(1, "Referral code is required")
  .max(32, "Referral code is too long")
  .transform((value) => value.toUpperCase());

export const applyReferralSchema = z.object({
  code: referralCodeSchema,
});

export const referralQuerySchema = z.object({
  status: z.nativeEnum(ReferralStatus).optional(),
  referrerUserId: z.string().trim().optional(),
  referredUserId: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateReferralStatusSchema = z.object({
  status: z.nativeEnum(ReferralStatus),
});

export type ApplyReferralInput = z.infer<typeof applyReferralSchema>;
export type ReferralQueryInput = z.infer<typeof referralQuerySchema>;
export type UpdateReferralStatusInput = z.infer<
  typeof updateReferralStatusSchema
>;
