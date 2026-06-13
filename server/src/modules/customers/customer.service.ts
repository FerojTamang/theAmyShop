import {
  AccountStatus,
  UserRole,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  CustomerQueryInput,
  UpdateCustomerStatusInput,
} from "./customer.validation.js";

const safeCustomerSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      profileImage: true,
      totalOrders: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      addresses: true,
      orders: true,
      reviews: true,
      referralsMade: true,
    },
  },
} as const;

const customerDetailSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      profileImage: true,
      totalOrders: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  addresses: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      province: true,
      district: true,
      city: true,
      streetAddress: true,
      landmark: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
  orders: {
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
  rewardWallet: {
    select: {
      id: true,
      balance: true,
      lifetimeEarned: true,
      lifetimeSpent: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  referralCode: {
    select: {
      id: true,
      code: true,
      totalReferrals: true,
      successfulReferrals: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  referralReceived: {
    select: {
      id: true,
      status: true,
      rewardGiven: true,
      createdAt: true,
      referrerUser: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
      referralCode: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
  _count: {
    select: {
      addresses: true,
      orders: true,
      reviews: true,
      referralsMade: true,
      rewardTransactions: true,
    },
  },
} as const;

const buildCustomerWhere = (
  query: CustomerQueryInput,
): Prisma.UserWhereInput => ({
  role: UserRole.CUSTOMER,
  ...(query.status && { status: query.status }),
  ...(query.search && {
    OR: [
      { fullName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ],
  }),
});

export const listAdminCustomers = async (query: CustomerQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildCustomerWhere(query);

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeCustomerSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminCustomerById = async (customerId: string) => {
  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: UserRole.CUSTOMER,
    },
    select: customerDetailSelect,
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const orderSummary = await prisma.order.aggregate({
    where: { userId: customerId },
    _count: {
      id: true,
    },
    _sum: {
      totalAmount: true,
    },
  });

  return {
    customer,
    summaries: {
      orders: {
        totalOrders: orderSummary._count.id,
        totalSpent: orderSummary._sum.totalAmount ?? 0,
        recentOrders: customer.orders,
      },
      rewards: customer.rewardWallet,
      referrals: {
        code: customer.referralCode,
        received: customer.referralReceived,
        madeCount: customer._count.referralsMade,
      },
    },
  };
};

export const updateAdminCustomerStatus = async (
  customerId: string,
  input: UpdateCustomerStatusInput,
) => {
  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: UserRole.CUSTOMER,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return prisma.user.update({
    where: { id: customerId },
    data: {
      status: input.status,
    },
    select: safeCustomerSelect,
  });
};

export const ACCOUNT_STATUS_VALUES = Object.values(AccountStatus);
