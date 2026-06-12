import { CouponType, type Coupon } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CouponSummary, CouponValidationResult } from "./coupon.types.js";
import type {
  CouponQueryInput,
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "./coupon.validation.js";

const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

const toNumber = (value: unknown): number => Number(value);

const toCouponSummary = (coupon: Coupon): CouponSummary => ({
  id: coupon.id,
  code: coupon.code,
  title: coupon.title,
  description: coupon.description,
  discountType: coupon.discountType,
  discountValue: toNumber(coupon.discountValue),
  minimumOrderAmount: toNumber(coupon.minimumOrderAmount),
  maximumDiscountAmount:
    coupon.maximumDiscountAmount === null
      ? null
      : toNumber(coupon.maximumDiscountAmount),
  usageLimit: coupon.usageLimit,
  usedCount: coupon.usedCount,
  perUserLimit: coupon.perUserLimit,
  startsAt: coupon.startsAt,
  expiresAt: coupon.expiresAt,
  isActive: coupon.isActive,
});

const ensureCouponCodeIsUnique = async (
  code: string,
  currentCouponId?: string,
): Promise<void> => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existingCoupon && existingCoupon.id !== currentCouponId) {
    throw new ApiError(409, "Coupon code already exists");
  }
};

const ensureDiscountValueIsValid = (
  discountType: CouponType,
  discountValue: number,
): void => {
  if (discountType === CouponType.PERCENTAGE_DISCOUNT && discountValue > 100) {
    throw new ApiError(400, "Percentage discount cannot exceed 100");
  }
};

const ensureDateRangeIsValid = (startsAt: Date, expiresAt: Date): void => {
  if (expiresAt <= startsAt) {
    throw new ApiError(400, "Expiration date must be after start date");
  }
};

const applyMaximumDiscountCap = (
  discountAmount: number,
  maximumDiscountAmount: number | null,
): number => {
  if (maximumDiscountAmount === null) {
    return discountAmount;
  }

  return Math.min(discountAmount, maximumDiscountAmount);
};

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const calculateDiscountAmount = (
  coupon: Coupon,
  input: ValidateCouponInput,
): number => {
  const discountValue = toNumber(coupon.discountValue);
  const maximumDiscountAmount =
    coupon.maximumDiscountAmount === null
      ? null
      : toNumber(coupon.maximumDiscountAmount);

  let discountAmount = 0;

  if (coupon.discountType === CouponType.PERCENTAGE_DISCOUNT) {
    discountAmount = (input.orderAmount * discountValue) / 100;
  }

  if (coupon.discountType === CouponType.FIXED_DISCOUNT) {
    discountAmount = discountValue;
  }

  if (coupon.discountType === CouponType.FREE_SHIPPING) {
    discountAmount = input.shippingFee;
  }

  if (coupon.discountType === CouponType.FREE_GIFT_WRAP) {
    discountAmount = input.giftWrapFee;
  }

  const cappedDiscountAmount = applyMaximumDiscountCap(
    discountAmount,
    maximumDiscountAmount,
  );

  return roundMoney(Math.min(cappedDiscountAmount, input.orderAmount));
};

const buildInvalidValidationResult = (
  reason: string,
  orderAmount: number,
  coupon: Coupon | null,
): CouponValidationResult => ({
  valid: false,
  discountAmount: 0,
  finalAmount: roundMoney(orderAmount),
  coupon: coupon ? toCouponSummary(coupon) : null,
  reason,
});

export const createCoupon = async (input: CreateCouponInput) => {
  const code = normalizeCouponCode(input.code);

  await ensureCouponCodeIsUnique(code);
  ensureDiscountValueIsValid(input.discountType, input.discountValue);

  return prisma.coupon.create({
    data: {
      code,
      title: input.title,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minimumOrderAmount: input.minimumOrderAmount,
      maximumDiscountAmount: input.maximumDiscountAmount,
      usageLimit: input.usageLimit,
      perUserLimit: input.perUserLimit,
      startsAt: input.startsAt,
      expiresAt: input.expiresAt,
      isActive: input.isActive ?? true,
    },
  });
};

export const listCoupons = async (query: CouponQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...(query.discountType && { discountType: query.discountType }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
    ...(query.search && {
      OR: [
        { code: { contains: query.search, mode: "insensitive" as const } },
        { title: { contains: query.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    coupons,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return coupon;
};

export const updateCoupon = async (id: string, input: UpdateCouponInput) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existingCoupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const code = input.code ? normalizeCouponCode(input.code) : undefined;

  if (code) {
    await ensureCouponCodeIsUnique(code, id);
  }

  const effectiveDiscountType = input.discountType ?? existingCoupon.discountType;
  const effectiveDiscountValue =
    input.discountValue ?? toNumber(existingCoupon.discountValue);
  const effectiveStartsAt = input.startsAt ?? existingCoupon.startsAt;
  const effectiveExpiresAt = input.expiresAt ?? existingCoupon.expiresAt;

  ensureDiscountValueIsValid(effectiveDiscountType, effectiveDiscountValue);
  ensureDateRangeIsValid(effectiveStartsAt, effectiveExpiresAt);

  return prisma.coupon.update({
    where: { id },
    data: {
      ...(code !== undefined && { code }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.discountType !== undefined && {
        discountType: input.discountType,
      }),
      ...(input.discountValue !== undefined && {
        discountValue: input.discountValue,
      }),
      ...(input.minimumOrderAmount !== undefined && {
        minimumOrderAmount: input.minimumOrderAmount,
      }),
      ...(input.maximumDiscountAmount !== undefined && {
        maximumDiscountAmount: input.maximumDiscountAmount,
      }),
      ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }),
      ...(input.perUserLimit !== undefined && {
        perUserLimit: input.perUserLimit,
      }),
      ...(input.startsAt !== undefined && { startsAt: input.startsAt }),
      ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
};

export const softDeleteCoupon = async (id: string) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCoupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });
};

export const validateCouponPreview = async (
  input: ValidateCouponInput,
): Promise<CouponValidationResult> => {
  const code = normalizeCouponCode(input.code);
  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return buildInvalidValidationResult(
      "Coupon does not exist",
      input.orderAmount,
      null,
    );
  }

  if (!coupon.isActive) {
    return buildInvalidValidationResult(
      "Coupon is inactive",
      input.orderAmount,
      coupon,
    );
  }

  const now = new Date();

  if (coupon.startsAt > now) {
    return buildInvalidValidationResult(
      "Coupon has not started yet",
      input.orderAmount,
      coupon,
    );
  }

  if (coupon.expiresAt < now) {
    return buildInvalidValidationResult(
      "Coupon has expired",
      input.orderAmount,
      coupon,
    );
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return buildInvalidValidationResult(
      "Coupon usage limit has been reached",
      input.orderAmount,
      coupon,
    );
  }

  if (input.orderAmount < toNumber(coupon.minimumOrderAmount)) {
    return buildInvalidValidationResult(
      "Minimum order amount is not satisfied",
      input.orderAmount,
      coupon,
    );
  }

  const discountAmount = calculateDiscountAmount(coupon, input);

  return {
    valid: true,
    discountAmount,
    finalAmount: roundMoney(input.orderAmount - discountAmount),
    coupon: toCouponSummary(coupon),
    reason: null,
  };
};
