import {
  PaymentMethod,
  PaymentStatus,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { paymentConfig, isEsewaConfigured, isKhaltiConfigured } from "../../config/payment.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  EsewaVerifyPaymentInput,
  InitiatePaymentInput,
  KhaltiVerifyPaymentInput,
  PaymentQueryInput,
  UpdatePaymentStatusInput,
} from "./payment.validation.js";

type PaymentClient = Prisma.TransactionClient | typeof prisma;
type OnlinePaymentMethod = Extract<PaymentMethod, "KHALTI" | "ESEWA">;

const gatewayCredentialsMessage = "Payment gateway credentials not configured";

const paymentInclude = {
  order: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      address: true,
    },
  },
} as const;

const toNumber = (value: unknown): number => Number(value);

const buildPaymentWhere = (
  query: PaymentQueryInput,
): Prisma.PaymentWhereInput => ({
  ...(query.provider && { provider: query.provider }),
  ...(query.status && { status: query.status }),
  ...(query.search && {
    OR: [
      {
        providerTransactionId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        order: {
          orderNumber: { contains: query.search, mode: "insensitive" },
        },
      },
      {
        order: {
          user: {
            fullName: { contains: query.search, mode: "insensitive" },
          },
        },
      },
      {
        order: {
          user: {
            phone: { contains: query.search, mode: "insensitive" },
          },
        },
      },
    ],
  }),
});

const createMissingPaymentRecords = async (
  where: Prisma.OrderWhereInput,
): Promise<void> => {
  const ordersWithoutPayment = await prisma.order.findMany({
    where: {
      ...where,
      payment: null,
    },
    select: {
      id: true,
      paymentMethod: true,
      totalAmount: true,
    },
  });

  if (ordersWithoutPayment.length === 0) {
    return;
  }

  await prisma.payment.createMany({
    data: ordersWithoutPayment.map((order) => ({
      orderId: order.id,
      provider: order.paymentMethod,
      amount: order.totalAmount,
      status: PaymentStatus.PENDING,
    })),
    skipDuplicates: true,
  });
};

const getOwnedOrderForPayment = async (
  client: PaymentClient,
  userId: string,
  orderId: string,
) => {
  const order = await client.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      totalAmount: true,
      userId: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

const getOrCreatePaymentForOrder = async (
  client: PaymentClient,
  order: {
    id: string;
    paymentMethod: PaymentMethod;
    totalAmount: Prisma.Decimal | number | string;
  },
) => {
  return client.payment.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      orderId: order.id,
      provider: order.paymentMethod,
      amount: toNumber(order.totalAmount),
      status: PaymentStatus.PENDING,
    },
    include: paymentInclude,
  });
};

const ensureGatewayPayment = (
  actualProvider: PaymentMethod,
  expectedProvider: OnlinePaymentMethod,
): void => {
  if (actualProvider !== expectedProvider) {
    throw new ApiError(
      400,
      `Order payment method must be ${expectedProvider} for this endpoint`,
    );
  }
};

const ensurePaymentIsNotAlreadyPaid = (
  paymentStatus: PaymentStatus,
  orderPaymentStatus: PaymentStatus,
): void => {
  if (
    paymentStatus === PaymentStatus.PAID ||
    orderPaymentStatus === PaymentStatus.PAID
  ) {
    throw new ApiError(409, "Payment has already been verified");
  }
};

const ensureProviderTransactionIsUnique = async (
  providerTransactionId: string,
  currentPaymentId: string,
): Promise<void> => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      providerTransactionId,
      id: {
        not: currentPaymentId,
      },
    },
    select: { id: true },
  });

  if (existingPayment) {
    throw new ApiError(409, "Payment transaction has already been used");
  }
};

export const listMyPayments = async (
  userId: string,
  query: PaymentQueryInput,
) => {
  await createMissingPaymentRecords({ userId });

  const skip = (query.page - 1) * query.limit;
  const where = {
    ...buildPaymentWhere(query),
    order: {
      userId,
    },
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getMyPaymentById = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      order: {
        userId,
      },
    },
    include: paymentInclude,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return payment;
};

export const initiateKhaltiPayment = async (
  userId: string,
  input: InitiatePaymentInput,
) => {
  return prisma.$transaction(async (tx) => {
    const order = await getOwnedOrderForPayment(tx, userId, input.orderId);
    ensureGatewayPayment(order.paymentMethod, PaymentMethod.KHALTI);
    const payment = await getOrCreatePaymentForOrder(tx, order);

    ensurePaymentIsNotAlreadyPaid(payment.status, order.paymentStatus);

    if (!isKhaltiConfigured()) {
      throw new ApiError(503, gatewayCredentialsMessage);
    }

    return {
      payment,
      gateway: PaymentMethod.KHALTI,
      configured: true,
      message: "Khalti initiation is ready for gateway integration",
      request: {
        amount: toNumber(order.totalAmount),
        purchaseOrderId: order.id,
        purchaseOrderName: order.orderNumber,
        returnUrl: paymentConfig.successUrl,
        websiteUrl: paymentConfig.failureUrl,
      },
    };
  });
};

export const initiateEsewaPayment = async (
  userId: string,
  input: InitiatePaymentInput,
) => {
  return prisma.$transaction(async (tx) => {
    const order = await getOwnedOrderForPayment(tx, userId, input.orderId);
    ensureGatewayPayment(order.paymentMethod, PaymentMethod.ESEWA);
    const payment = await getOrCreatePaymentForOrder(tx, order);

    ensurePaymentIsNotAlreadyPaid(payment.status, order.paymentStatus);

    if (!isEsewaConfigured()) {
      throw new ApiError(503, gatewayCredentialsMessage);
    }

    return {
      payment,
      gateway: PaymentMethod.ESEWA,
      configured: true,
      message: "eSewa initiation is ready for gateway integration",
      request: {
        amount: toNumber(order.totalAmount),
        transactionUuid: order.id,
        productCode: paymentConfig.esewa.merchantCode,
        successUrl: paymentConfig.successUrl,
        failureUrl: paymentConfig.failureUrl,
      },
    };
  });
};

export const verifyKhaltiPayment = async (
  userId: string,
  input: KhaltiVerifyPaymentInput,
) => {
  const order = await getOwnedOrderForPayment(prisma, userId, input.orderId);
  ensureGatewayPayment(order.paymentMethod, PaymentMethod.KHALTI);
  const payment = await getOrCreatePaymentForOrder(prisma, order);
  const providerTransactionId = input.transactionId ?? input.pidx;

  ensurePaymentIsNotAlreadyPaid(payment.status, order.paymentStatus);

  if (providerTransactionId) {
    await ensureProviderTransactionIsUnique(providerTransactionId, payment.id);
  }

  if (!isKhaltiConfigured()) {
    throw new ApiError(503, gatewayCredentialsMessage);
  }

  throw new ApiError(
    501,
    "Khalti backend verification is not implemented yet",
  );
};

export const verifyEsewaPayment = async (
  userId: string,
  input: EsewaVerifyPaymentInput,
) => {
  const order = await getOwnedOrderForPayment(prisma, userId, input.orderId);
  ensureGatewayPayment(order.paymentMethod, PaymentMethod.ESEWA);
  const payment = await getOrCreatePaymentForOrder(prisma, order);
  const providerTransactionId = input.transactionId ?? input.transactionCode;

  ensurePaymentIsNotAlreadyPaid(payment.status, order.paymentStatus);

  if (providerTransactionId) {
    await ensureProviderTransactionIsUnique(providerTransactionId, payment.id);
  }

  if (!isEsewaConfigured()) {
    throw new ApiError(503, gatewayCredentialsMessage);
  }

  throw new ApiError(501, "eSewa backend verification is not implemented yet");
};

export const listAdminPayments = async (query: PaymentQueryInput) => {
  await createMissingPaymentRecords({});

  const skip = (query.page - 1) * query.limit;
  const where = buildPaymentWhere(query);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminPaymentById = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return payment;
};

export const updateAdminPaymentStatus = async (
  paymentId: string,
  input: UpdatePaymentStatusInput,
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: input.status,
        ...(input.rawResponse && {
          rawResponse: input.rawResponse as Prisma.InputJsonValue,
        }),
      },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: {
        paymentStatus: input.status,
      },
    });

    return tx.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: paymentInclude,
    });
  });
};
