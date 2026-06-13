import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long");

export const updateAccountProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").optional(),
    phone: phoneSchema.optional(),
    profileImage: z.string().trim().url("Profile image must be a valid URL").nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match",
  });

export type UpdateAccountProfileInput = z.infer<
  typeof updateAccountProfileSchema
>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
