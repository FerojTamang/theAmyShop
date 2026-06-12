import { GiftPrintStatus } from "../../../generated/prisma/client.js";
import { z } from "zod";

export const giftOptionQuerySchema = z.object({
  printStatus: z.nativeEnum(GiftPrintStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateGiftPrintStatusSchema = z.object({
  printStatus: z.nativeEnum(GiftPrintStatus),
});

export type GiftOptionQueryInput = z.infer<typeof giftOptionQuerySchema>;
export type UpdateGiftPrintStatusInput = z.infer<
  typeof updateGiftPrintStatusSchema
>;
