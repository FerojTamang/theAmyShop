import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  OrderQueryInput,
  UpdateOrderStatusInput,
} from "./order.validation.js";

const orderInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  },
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
  payment: true,
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

const buildOrderWhere = (query: OrderQueryInput): Prisma.OrderWhereInput => ({
  ...(query.orderStatus && { orderStatus: query.orderStatus }),
  ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
  ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
  ...(query.search && {
    OR: [
      { orderNumber: { contains: query.search, mode: "insensitive" } },
      {
        user: {
          fullName: { contains: query.search, mode: "insensitive" },
        },
      },
      {
        user: {
          phone: { contains: query.search, mode: "insensitive" },
        },
      },
    ],
  }),
});

export const listMyOrders = async (userId: string, query: OrderQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...buildOrderWhere(query),
    userId,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getMyOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

export const listAdminOrders = async (query: OrderQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildOrderWhere(query);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

export const updateAdminOrderStatus = async (
  adminUserId: string,
  orderId: string,
  input: UpdateOrderStatusInput,
) => {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderStatus: true,
      },
    });

    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    if (existingOrder.orderStatus === input.orderStatus) {
      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude,
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: input.orderStatus,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        oldStatus: existingOrder.orderStatus,
        newStatus: input.orderStatus,
        changedByUserId: adminUserId,
        note: input.note,
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderInclude,
    });
  });
};
