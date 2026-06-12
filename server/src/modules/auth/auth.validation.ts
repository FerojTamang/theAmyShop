import { z } from "zod";

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Email must be valid")
  .toLowerCase()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: optionalEmailSchema,
  phone: z.string().trim().min(7, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
