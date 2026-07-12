import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

import {
  CouponType,
  Prisma,
  type Coupon,
} from "../../generated/prisma/client.js";
import { validateCouponPreview } from "../../src/modules/coupons/coupon.service.js";
import { prismaMock } from "../helpers/prismaMock.js";

const coupon: Coupon = {
  id: "coupon-preview-1",
  code: "PREVIEW10",
  title: "Preview coupon",
  description: null,
  discountType: CouponType.PERCENTAGE_DISCOUNT,
  discountValue: new Prisma.Decimal(10),
  minimumOrderAmount: new Prisma.Decimal(100),
  maximumDiscountAmount: null,
  usageLimit: 100,
  usedCount: 0,
  perUserLimit: 1,
  startsAt: new Date("2025-01-01T00:00:00.000Z"),
  expiresAt: new Date("2100-01-01T00:00:00.000Z"),
  isActive: true,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

describe("coupon preview", () => {
  beforeEach(() => {
    prismaMock.coupon.findUnique.mockResolvedValue(coupon);
  });

  it("calculates an informational preview without reserving usage", async () => {
    const result = await validateCouponPreview({
      code: coupon.code,
      orderAmount: 1000,
      shippingFee: 0,
      giftWrapFee: 0,
    });

    expect(result).toMatchObject({
      valid: true,
      discountAmount: 100,
      finalAmount: 900,
      reason: null,
    });
    expect(prismaMock.coupon.findUnique).toHaveBeenCalledOnce();
    expect(prismaMock.coupon.update).not.toHaveBeenCalled();
    expect(prismaMock.coupon.updateManyAndReturn).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
