import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

import {
  CouponType,
  PaymentMethod,
  Prisma,
  StockType,
  type Coupon,
} from "../../generated/prisma/client.js";
import { createCheckoutOrder } from "../../src/modules/checkout/checkout.service.js";
import { checkoutSchema } from "../../src/modules/checkout/checkout.validation.js";
import {
  createCheckoutTransactionMock,
  mockInteractiveTransaction,
  prismaMock,
} from "../helpers/prismaMock.js";

const userId = "user-1";
const addressId = "address-1";

const buildCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: "coupon-1",
  code: "QA10",
  title: "QA coupon",
  description: null,
  discountType: CouponType.FIXED_DISCOUNT,
  discountValue: new Prisma.Decimal(10),
  minimumOrderAmount: new Prisma.Decimal(0),
  maximumDiscountAmount: null,
  usageLimit: 1,
  usedCount: 0,
  perUserLimit: 1,
  startsAt: new Date("2025-01-01T00:00:00.000Z"),
  expiresAt: new Date("2100-01-01T00:00:00.000Z"),
  isActive: true,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

const buildGift = (giftWrapRequired: boolean) => ({
  receiverName: "Receiver",
  senderName: "Sender",
  giftMessage: "A test gift",
  giftWrapRequired,
});

describe("checkout fee and coupon integrity", () => {
  let tx: ReturnType<typeof createCheckoutTransactionMock>;

  beforeEach(() => {
    tx = createCheckoutTransactionMock();
    mockInteractiveTransaction(tx);

    tx.address.findFirst.mockResolvedValue({ id: addressId });
    tx.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      items: [
        {
          productId: "product-1",
          customizationRequestId: null,
          quantity: 2,
          product: {
            id: "product-1",
            name: "QA Product",
            price: 100,
            stock: 10,
            stockType: StockType.READY_STOCK,
            isActive: true,
          },
          customizationRequest: null,
        },
      ],
    });
    tx.order.findUnique.mockResolvedValue(null);
    tx.order.create.mockResolvedValue({ id: "order-1" });
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.order.findUniqueOrThrow.mockResolvedValue({ id: "order-1" });
  });

  it("strips legacy client-controlled fee fields from checkout input", () => {
    const parsed = checkoutSchema.parse({
      addressId,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      shippingFee: 999,
      gift: {
        ...buildGift(true),
        giftWrapFee: 1,
      },
    });

    expect(parsed).not.toHaveProperty("shippingFee");
    expect(parsed.gift).not.toHaveProperty("giftWrapFee");
  });

  it("uses zero shipping and zero gift-wrap fee when wrapping is not requested", async () => {
    await createCheckoutOrder(
      userId,
      {
        addressId,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        shippingFee: 999,
        gift: {
          ...buildGift(false),
          giftWrapFee: 999,
        },
      } as unknown as Parameters<typeof createCheckoutOrder>[1],
    );

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 200,
          shippingFee: 0,
          giftWrapFee: 0,
          totalAmount: 200,
          giftOption: {
            create: expect.objectContaining({ giftWrapFee: 0 }),
          },
        }),
      }),
    );
  });

  it("uses the server-owned gift-wrap fee when wrapping is requested", async () => {
    await createCheckoutOrder(
      userId,
      {
        addressId,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        shippingFee: 999,
        gift: {
          ...buildGift(true),
          giftWrapFee: 1,
        },
      } as unknown as Parameters<typeof createCheckoutOrder>[1],
    );

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 200,
          shippingFee: 0,
          giftWrapFee: 50,
          totalAmount: 250,
          giftOption: {
            create: expect.objectContaining({ giftWrapFee: 50 }),
          },
        }),
      }),
    );
  });

  it("rejects checkout when the atomic global coupon reservation is exhausted", async () => {
    const coupon = buildCoupon();
    tx.coupon.findUnique.mockResolvedValue(coupon);
    tx.coupon.updateManyAndReturn.mockResolvedValue([]);

    await expect(
      createCheckoutOrder(userId, {
        addressId,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        couponCode: coupon.code,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Coupon is no longer available.",
    });

    expect(tx.coupon.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: coupon.id,
          usageLimit: 1,
          usedCount: { lt: 1 },
        }),
        data: { usedCount: { increment: 1 } },
        limit: 1,
      }),
    );
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.couponRedemption.create).not.toHaveBeenCalled();
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it("rechecks the per-user limit while the reserved coupon row is locked", async () => {
    const coupon = buildCoupon({ usedCount: 1, usageLimit: 10 });
    tx.coupon.findUnique.mockResolvedValue(
      buildCoupon({ usedCount: 0, usageLimit: 10 }),
    );
    tx.coupon.updateManyAndReturn.mockResolvedValue([coupon]);
    tx.couponRedemption.count.mockResolvedValue(1);

    await expect(
      createCheckoutOrder(userId, {
        addressId,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        couponCode: coupon.code,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Coupon is no longer available.",
    });

    expect(tx.couponRedemption.count).toHaveBeenCalledWith({
      where: { couponId: coupon.id, userId },
    });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.couponRedemption.create).not.toHaveBeenCalled();
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
  });
});
