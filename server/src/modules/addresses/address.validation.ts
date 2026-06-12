import { z } from "zod";

const requiredTextSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long");

export const createAddressSchema = z.object({
  fullName: requiredTextSchema("Full name"),
  phone: phoneSchema,
  province: requiredTextSchema("Province"),
  district: requiredTextSchema("District"),
  city: requiredTextSchema("City"),
  streetAddress: requiredTextSchema("Street address"),
  landmark: z.string().trim().nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = z
  .object({
    fullName: requiredTextSchema("Full name").optional(),
    phone: phoneSchema.optional(),
    province: requiredTextSchema("Province").optional(),
    district: requiredTextSchema("District").optional(),
    city: requiredTextSchema("City").optional(),
    streetAddress: requiredTextSchema("Street address").optional(),
    landmark: z.string().trim().nullable().optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
