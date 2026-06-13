import {
  OrderStatus,
  PaymentStatus,
  ReviewStatus,
  StockType,
  UserRole,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import type {
  DailySalesOverview,
  DashboardStatusCount,
} from "./dashboard.types.js";
import type {
  DashboardDateRangeInput,
  LowStockProductsQueryInput,
  RecentOrdersQueryInput,
} from "./dashboard.validation.js";

const LOW_STOCK_SUMMARY_THRESHOLD = 5;
const SALES_OVERVIEW_DEFAULT_DAYS = 7;

const safeOrderSelect = {
  id: true,
  orderNumber: true,
  subtotal: true,
  couponDiscount: true,
  gemsDiscount: true,
  customizationFee: true,
  giftWrapFee: true,
  shippingFee: true,
  totalAmount: true,
  paymentMethod: true,
  paymentStatus: true,
  orderStatus: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  },
} as const;

const lowStockProductSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  stock: true,
  stockType: true,
  isActive: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    where: {
      isPrimary: true,
    },
    select: {
      id: true,
      imageUrl: true,
      publicId: true,
      isPrimary: true,
    },
    take: 1,
  },
} as const;

const toNumber = (value: unknown): number => Number(value ?? 0);

const startOfToday = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const buildCreatedAtWhere = (
  query: DashboardDateRangeInput,
): Prisma.DateTimeFilter | undefined => {
  if (!query.from && !query.to) {
    return undefined;
  }

  return {
    ...(query.from && { gte: query.from }),
    ...(query.to && { lte: query.to }),
  };
};

const buildOrderWhere = (
  query: DashboardDateRangeInput,
): Prisma.OrderWhereInput => ({
  ...(buildCreatedAtWhere(query) && {
    createdAt: buildCreatedAtWhere(query),
  }),
});

const buildPaidOrderWhere = (
  query: DashboardDateRangeInput,
): Prisma.OrderWhereInput => ({
  ...buildOrderWhere(query),
  paymentStatus: PaymentStatus.PAID,
});

const normalizeStatusCounts = <TStatus extends string>(
  statuses: readonly TStatus[],
  grouped: Array<{ _count: { _all: number } } & Record<string, unknown>>,
  fieldName: string,
): DashboardStatusCount<TStatus>[] => {
  const counts = new Map<TStatus, number>();

  grouped.forEach((item) => {
    counts.set(item[fieldName] as TStatus, item._count._all);
  });

  return statuses.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
};

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const getSalesOverviewRange = (
  query: DashboardDateRangeInput,
): Required<DashboardDateRangeInput> => {
  if (query.from || query.to) {
    return {
      from: query.from ?? new Date(0),
      to: query.to ?? new Date(),
    };
  }

  const today = startOfToday();

  return {
    from: addDays(today, -(SALES_OVERVIEW_DEFAULT_DAYS - 1)),
    to: addDays(today, 1),
  };
};

export const getDashboardSummary = async () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    revenueAggregate,
    pendingOrders,
    pendingReviews,
    lowStockProducts,
    todayOrders,
    todayRevenueAggregate,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.CUSTOMER,
      },
    }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: OrderStatus.PENDING,
      },
    }),
    prisma.review.count({
      where: {
        status: ReviewStatus.PENDING,
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stockType: StockType.READY_STOCK,
        stock: {
          lte: LOW_STOCK_SUMMARY_THRESHOLD,
        },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    totalCustomers,
    totalProducts,
    totalOrders,
    totalRevenue: toNumber(revenueAggregate._sum.totalAmount),
    pendingOrders,
    pendingReviews,
    lowStockProducts,
    todayOrders,
    todayRevenue: toNumber(todayRevenueAggregate._sum.totalAmount),
  };
};

export const getRecentOrders = async (query: RecentOrdersQueryInput) => {
  const orders = await prisma.order.findMany({
    where: buildOrderWhere(query),
    select: safeOrderSelect,
    orderBy: { createdAt: "desc" },
    take: query.limit,
  });

  return {
    orders: orders.map((order) => ({
      ...order,
      subtotal: toNumber(order.subtotal),
      couponDiscount: toNumber(order.couponDiscount),
      gemsDiscount: toNumber(order.gemsDiscount),
      customizationFee: toNumber(order.customizationFee),
      giftWrapFee: toNumber(order.giftWrapFee),
      shippingFee: toNumber(order.shippingFee),
      totalAmount: toNumber(order.totalAmount),
    })),
  };
};

export const getLowStockProducts = async (
  query: LowStockProductsQueryInput,
) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stockType: StockType.READY_STOCK,
      stock: {
        lte: query.lowStockThreshold,
      },
    },
    select: lowStockProductSelect,
    orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
    take: query.limit,
  });

  return {
    threshold: query.lowStockThreshold,
    products: products.map((product) => ({
      ...product,
      price: toNumber(product.price),
      primaryImage: product.images[0] ?? null,
      images: undefined,
    })),
  };
};

export const getSalesOverview = async (query: DashboardDateRangeInput) => {
  const range = getSalesOverviewRange(query);
  const orders = await prisma.order.findMany({
    where: buildPaidOrderWhere(range),
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const dailySales = new Map<string, DailySalesOverview>();
  const dayCount = Math.max(
    1,
    Math.ceil((range.to.getTime() - range.from.getTime()) / 86_400_000),
  );

  for (let index = 0; index < dayCount; index += 1) {
    const date = addDays(range.from, index);
    const dateKey = toDateKey(date);

    dailySales.set(dateKey, {
      date: dateKey,
      orderCount: 0,
      revenue: 0,
    });
  }

  orders.forEach((order) => {
    const dateKey = toDateKey(order.createdAt);
    const currentValue =
      dailySales.get(dateKey) ??
      ({
        date: dateKey,
        orderCount: 0,
        revenue: 0,
      } satisfies DailySalesOverview);

    currentValue.orderCount += 1;
    currentValue.revenue += toNumber(order.totalAmount);
    dailySales.set(dateKey, currentValue);
  });

  return {
    from: range.from,
    to: range.to,
    sales: Array.from(dailySales.values()).map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * 100) / 100,
    })),
  };
};

export const getOrderStatusSummary = async (query: DashboardDateRangeInput) => {
  const grouped = await prisma.order.groupBy({
    by: ["orderStatus"],
    where: buildOrderWhere(query),
    _count: {
      _all: true,
    },
  });

  return {
    statuses: normalizeStatusCounts(
      Object.values(OrderStatus),
      grouped,
      "orderStatus",
    ),
  };
};

export const getPaymentStatusSummary = async (
  query: DashboardDateRangeInput,
) => {
  const grouped = await prisma.order.groupBy({
    by: ["paymentStatus"],
    where: buildOrderWhere(query),
    _count: {
      _all: true,
    },
  });

  return {
    statuses: normalizeStatusCounts(
      Object.values(PaymentStatus),
      grouped,
      "paymentStatus",
    ),
  };
};

export const getReviewSummary = async (query: DashboardDateRangeInput) => {
  const createdAt = buildCreatedAtWhere(query);
  const where: Prisma.ReviewWhereInput = {
    ...(createdAt && { createdAt }),
  };

  const [grouped, ratingAggregate] = await Promise.all([
    prisma.review.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.review.aggregate({
      where,
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    }),
  ]);

  return {
    statuses: normalizeStatusCounts(
      Object.values(ReviewStatus),
      grouped,
      "status",
    ),
    averageRating:
      ratingAggregate._avg.rating === null
        ? 0
        : Math.round(ratingAggregate._avg.rating * 10) / 10,
    reviewCount: ratingAggregate._count.rating,
  };
};
