import { CouponType } from "../../../generated/prisma/client.js";
import { z } from "zod";

const moneySchema = z.coerce.number().finite().min(0);

const optionalNullableMoneySchema = z
  .union([moneySchema, z.null()])
  .optional();

const couponCodeSchema = z
  .string()
  .trim()
  .min(1, "Coupon code is required")
  .max(50, "Coupon code is too long")
  .transform((value) => value.toUpperCase());

const dateSchema = z.coerce
  .date()
  .refine((value) => !Number.isNaN(value.getTime()), "Invalid date");

const validateDiscountRules = (
  value: { discountType?: CouponType; discountValue?: number },
  context: z.RefinementCtx,
) => {
  if (
    value.discountType === CouponType.PERCENTAGE_DISCOUNT &&
    value.discountValue !== undefined &&
    value.discountValue > 100
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Percentage discount cannot exceed 100",
    });
  }
};

export const couponQuerySchema = z.object({
  search: z.string().trim().optional(),
  discountType: z.nativeEnum(CouponType).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createCouponSchema = z
  .object({
    code: couponCodeSchema,
    title: z.string().trim().min(2, "Coupon title is required"),
    description: z.string().trim().optional(),
    discountType: z.nativeEnum(CouponType),
    discountValue: moneySchema.default(0),
    minimumOrderAmount: moneySchema.default(0),
    maximumDiscountAmount: moneySchema.optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    perUserLimit: z.coerce.number().int().positive().default(1),
    startsAt: dateSchema,
    expiresAt: dateSchema,
    isActive: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    validateDiscountRules(value, context);

    if (value.expiresAt <= value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Expiration date must be after start date",
      });
    }
  });

export const updateCouponSchema = z
  .object({
    code: couponCodeSchema.optional(),
    title: z.string().trim().min(2, "Coupon title is required").optional(),
    description: z.string().trim().nullable().optional(),
    discountType: z.nativeEnum(CouponType).optional(),
    discountValue: moneySchema.optional(),
    minimumOrderAmount: moneySchema.optional(),
    maximumDiscountAmount: optionalNullableMoneySchema,
    usageLimit: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
    perUserLimit: z.coerce.number().int().positive().optional(),
    startsAt: dateSchema.optional(),
    expiresAt: dateSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })
  .superRefine(validateDiscountRules);

export const validateCouponSchema = z.object({
  code: couponCodeSchema,
  orderAmount: moneySchema,
  shippingFee: moneySchema.default(0),
  giftWrapFee: moneySchema.default(0),
});

export type CouponQueryInput = z.infer<typeof couponQuerySchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
