import { CustomizationStatus } from "../../../generated/prisma/client.js";
import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined));

const futureDateSchema = z
  .string()
  .trim()
  .datetime("neededByDate must be a valid ISO date")
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: "neededByDate must be in the future",
  })
  .optional();

const referenceImageSchema = z.object({
  imageUrl: z.string().trim().url("Image URL must be valid"),
  publicId: optionalTrimmedString,
});

export const createCustomizationSchema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
  customText: optionalTrimmedString,
  colorPreference: optionalTrimmedString,
  sizePreference: optionalTrimmedString,
  designNote: optionalTrimmedString,
  neededByDate: futureDateSchema,
  referenceImages: z.array(referenceImageSchema).max(5).optional(),
});

export const adminCustomizationQuerySchema = z.object({
  status: z.nativeEnum(CustomizationStatus).optional(),
  productId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateCustomizationStatusSchema = z.object({
  status: z.nativeEnum(CustomizationStatus),
  adminNote: optionalTrimmedString,
});

export type CreateCustomizationInput = z.infer<
  typeof createCustomizationSchema
>;
export type AdminCustomizationQueryInput = z.infer<
  typeof adminCustomizationQuerySchema
>;
export type UpdateCustomizationStatusInput = z.infer<
  typeof updateCustomizationStatusSchema
>;
