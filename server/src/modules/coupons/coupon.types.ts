import type { CouponType } from "../../../generated/prisma/client.js";

export type CouponSummary = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: CouponType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
};

export type CouponValidationResult = {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  coupon: CouponSummary | null;
  reason: string | null;
};
