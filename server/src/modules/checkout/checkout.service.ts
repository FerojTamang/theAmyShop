import {
  CouponType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  type Coupon,
  type Prisma,
  StockType,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  calculateOrderTotal,
  roundMoney,
} from "../../utils/calculateOrderTotal.js";
import { generateOrderNumber } from "../../utils/generateOrderNumber.js";
import type { CheckoutInput } from "./checkout.validation.js";

type CheckoutClient = Prisma.TransactionClient;

const STANDARD_SHIPPING_FEE = 0;
const GIFT_WRAP_FEE = 50;

const orderInclude = {
  address: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      customizationRequest: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  giftOption: true,
  couponRedemptions: {
    include: {
      coupon: true,
    },
  },
  statusHistory: {
    include: {
      changedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

const decimalToNumber = (value: unknown): number => Number(value);

const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

const calculateCouponDiscount = (
  coupon: Coupon,
  subtotal: number,
  shippingFee: number,
  giftWrapFee: number,
): number => {
  const discountValue = decimalToNumber(coupon.discountValue);
  const maximumDiscountAmount =
    coupon.maximumDiscountAmount === null
      ? null
      : decimalToNumber(coupon.maximumDiscountAmount);

  let discountAmount = 0;

  if (coupon.discountType === CouponType.PERCENTAGE_DISCOUNT) {
    discountAmount = (subtotal * discountValue) / 100;
  }

  if (coupon.discountType === CouponType.FIXED_DISCOUNT) {
    discountAmount = discountValue;
  }

  if (coupon.discountType === CouponType.FREE_SHIPPING) {
    discountAmount = shippingFee;
  }

  if (coupon.discountType === CouponType.FREE_GIFT_WRAP) {
    discountAmount = giftWrapFee;
  }

  if (maximumDiscountAmount !== null) {
    discountAmount = Math.min(discountAmount, maximumDiscountAmount);
  }

  return roundMoney(Math.min(discountAmount, subtotal + shippingFee + giftWrapFee));
};

const reserveCouponForCheckout = async (
  tx: CheckoutClient,
  userId: string,
  couponCode: string,
  subtotal: number,
  shippingFee: number,
  giftWrapFee: number,
) => {
  const normalizedCode = normalizeCouponCode(couponCode);
  const existingCoupon = await tx.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!existingCoupon) {
    throw new ApiError(400, "Coupon does not exist");
  }

  const reservationTime = new Date();
  const reservedCoupons = await tx.coupon.updateManyAndReturn({
    where: {
      id: existingCoupon.id,
      code: normalizedCode,
      isActive: true,
      startsAt: { lte: reservationTime },
      expiresAt: { gte: reservationTime },
      usageLimit: existingCoupon.usageLimit,
      ...(existingCoupon.usageLimit !== null && {
        usedCount: { lt: existingCoupon.usageLimit },
      }),
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
    limit: 1,
  });

  const coupon = reservedCoupons[0];

  if (!coupon) {
    throw new ApiError(400, "Coupon is no longer available.");
  }

  const validationTime = new Date();

  if (
    !coupon.isActive ||
    coupon.startsAt > validationTime ||
    coupon.expiresAt < validationTime ||
    (coupon.usageLimit !== null && coupon.usedCount > coupon.usageLimit)
  ) {
    throw new ApiError(400, "Coupon is no longer available.");
  }

  if (subtotal < decimalToNumber(coupon.minimumOrderAmount)) {
    throw new ApiError(400, "Minimum order amount is not satisfied");
  }

  // Reserving usage updates and locks the coupon row until this transaction ends,
  // so this count observes any earlier committed redemption for the same coupon.
  const userRedemptionCount = await tx.couponRedemption.count({
    where: {
      couponId: coupon.id,
      userId,
    },
  });

  if (userRedemptionCount >= coupon.perUserLimit) {
    throw new ApiError(400, "Coupon is no longer available.");
  }

  return {
    coupon,
    discountAmount: calculateCouponDiscount(
      coupon,
      subtotal,
      shippingFee,
      giftWrapFee,
    ),
  };
};

const getCartForCheckout = async (tx: CheckoutClient, userId: string) => {
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              stockType: true,
              isActive: true,
            },
          },
          customizationRequest: {
            select: {
              id: true,
              userId: true,
              customizationFee: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  return cart;
};

const validateAddress = async (
  tx: CheckoutClient,
  userId: string,
  addressId: string,
): Promise<void> => {
  const address = await tx.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
    select: { id: true },
  });

  if (!address) {
    throw new ApiError(400, "Address does not exist for this user");
  }
};

const createUniqueOrderNumber = async (
  tx: CheckoutClient,
): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const existingOrder = await tx.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new ApiError(500, "Could not generate a unique order number");
};

export const createCheckoutOrder = async (
  userId: string,
  input: CheckoutInput,
) => {
  const orderId = await prisma.$transaction(async (tx) => {
    await validateAddress(tx, userId, input.addressId);

    const cart = await getCartForCheckout(tx, userId);
    let subtotal = 0;
    let customizationFee = 0;

    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        throw new ApiError(400, "Product no longer exists");
      }

      if (!item.product.isActive) {
        throw new ApiError(400, `${item.product.name} is not active`);
      }

      if (item.product.stock <= 0) {
        throw new ApiError(400, `${item.product.name} is out of stock`);
      }

      if (item.product.stockType === StockType.OUT_OF_STOCK) {
        throw new ApiError(400, `${item.product.name} is out of stock`);
      }

      if (
        item.product.stockType === StockType.READY_STOCK &&
        item.quantity > item.product.stock
      ) {
        throw new ApiError(
          400,
          `${item.product.name} quantity exceeds available stock`,
        );
      }

      if (
        item.customizationRequest &&
        item.customizationRequest.userId !== userId
      ) {
        throw new ApiError(400, "Customization request does not belong to user");
      }

      const priceSnapshot = decimalToNumber(item.product.price);
      subtotal += priceSnapshot * item.quantity;

      if (item.customizationRequest) {
        customizationFee += decimalToNumber(
          item.customizationRequest.customizationFee,
        );
      }

      orderItems.push({
        productId: item.product.id,
        customizationRequestId: item.customizationRequestId,
        productNameSnapshot: item.product.name,
        priceSnapshot,
        quantity: item.quantity,
      });
    }

    const shippingFee = STANDARD_SHIPPING_FEE;
    const giftWrapFee =
      input.gift?.giftWrapRequired === true ? GIFT_WRAP_FEE : 0;
    const couponResult = input.couponCode
      ? await reserveCouponForCheckout(
          tx,
          userId,
          input.couponCode,
          subtotal,
          shippingFee,
          giftWrapFee,
        )
      : null;
    const totals = calculateOrderTotal({
      subtotal,
      couponDiscount: couponResult?.discountAmount ?? 0,
      gemsDiscount: 0,
      customizationFee,
      giftWrapFee,
      shippingFee,
    });
    const orderNumber = await createUniqueOrderNumber(tx);

    const order = await tx.order.create({
      data: {
        userId,
        addressId: input.addressId,
        orderNumber,
        subtotal: totals.subtotal,
        couponDiscount: totals.couponDiscount,
        gemsDiscount: totals.gemsDiscount,
        customizationFee: totals.customizationFee,
        giftWrapFee: totals.giftWrapFee,
        shippingFee: totals.shippingFee,
        totalAmount: totals.totalAmount,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        items: {
          create: orderItems,
        },
        giftOption: input.gift
          ? {
              create: {
                receiverName: input.gift.receiverName,
                senderName: input.gift.senderName,
                giftMessage: input.gift.giftMessage,
                giftWrapRequired: input.gift.giftWrapRequired,
                giftWrapFee,
              },
            }
          : undefined,
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: OrderStatus.PENDING,
            changedByUserId: userId,
            note: "Order created",
          },
        },
      },
      include: orderInclude,
    });

    for (const item of cart.items) {
      if (item.product.stockType === StockType.READY_STOCK) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.product.id,
            isActive: true,
            stockType: StockType.READY_STOCK,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count !== 1) {
          throw new ApiError(
            400,
            `${item.product.name} stock changed before checkout completed`,
          );
        }
      }
    }

    if (couponResult) {
      await tx.couponRedemption.create({
        data: {
          couponId: couponResult.coupon.id,
          userId,
          orderId: order.id,
          discountAmount: totals.couponDiscount,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order.id;
  }, { timeout: 15000 });

  return prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: orderInclude,
  });
};
