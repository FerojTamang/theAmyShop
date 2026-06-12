import {
  OrderStatus,
  ReviewStatus,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type { RatingSummary } from "./review.types.js";
import type {
  CreateReviewInput,
  PublicProductReviewQueryInput,
  ReviewQueryInput,
  UpdateReviewInput,
  UpdateReviewStatusInput,
} from "./review.validation.js";

const safeReviewInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      createdAt: true,
    },
  },
} as const;

const adminReviewInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      createdAt: true,
    },
  },
} as const;

const calculateRatingSummary = async (
  productId: string,
): Promise<RatingSummary> => {
  const aggregate = await prisma.review.aggregate({
    where: {
      productId,
      status: ReviewStatus.APPROVED,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    averageRating:
      aggregate._avg.rating === null
        ? 0
        : Math.round(aggregate._avg.rating * 10) / 10,
    reviewCount: aggregate._count.rating,
  };
};

const buildAdminReviewWhere = (
  query: ReviewQueryInput,
): Prisma.ReviewWhereInput => ({
  ...(query.status && { status: query.status }),
  ...(query.productId && { productId: query.productId }),
  ...(query.userId && { userId: query.userId }),
});

const ensureProductExists = async (productId: string): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }
};

const verifyDeliveredPurchase = async (
  userId: string,
  input: CreateReviewInput,
): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      userId,
    },
    select: {
      id: true,
      orderStatus: true,
      items: {
        where: {
          productId: input.productId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(400, "Order does not belong to user");
  }

  if (order.orderStatus !== OrderStatus.DELIVERED) {
    throw new ApiError(400, "Review is allowed only after order is delivered");
  }

  if (order.items.length === 0) {
    throw new ApiError(400, "Product was not purchased in this order");
  }
};

export const listPublicProductReviews = async (
  productId: string,
  query: PublicProductReviewQueryInput,
) => {
  await ensureProductExists(productId);

  const skip = (query.page - 1) * query.limit;
  const where = {
    productId,
    status: ReviewStatus.APPROVED,
  };

  const [reviews, total, summary] = await Promise.all([
    prisma.review.findMany({
      where,
      include: safeReviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.review.count({ where }),
    calculateRatingSummary(productId),
  ]);

  return {
    reviews,
    summary,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const createReview = async (
  userId: string,
  input: CreateReviewInput,
) => {
  await ensureProductExists(input.productId);
  await verifyDeliveredPurchase(userId, input);

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId_orderId: {
        userId,
        productId: input.productId,
        orderId: input.orderId,
      },
    },
    select: { id: true },
  });

  if (existingReview) {
    throw new ApiError(409, "Review already exists for this product and order");
  }

  return prisma.review.create({
    data: {
      userId,
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
      status: ReviewStatus.PENDING,
    },
    include: safeReviewInclude,
  });
};

export const listMyReviews = async (userId: string, query: ReviewQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...buildAdminReviewWhere(query),
    userId,
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: safeReviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getMyReviewById = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
    include: safeReviewInclude,
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return review;
};

export const updateMyReview = async (
  userId: string,
  reviewId: string,
  input: UpdateReviewInput,
) => {
  await getMyReviewById(userId, reviewId);

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.comment !== undefined && { comment: input.comment }),
      status: ReviewStatus.PENDING,
    },
    include: safeReviewInclude,
  });
};

export const softDeleteMyReview = async (userId: string, reviewId: string) => {
  await getMyReviewById(userId, reviewId);

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: ReviewStatus.DELETED,
    },
    include: safeReviewInclude,
  });
};

export const listAdminReviews = async (query: ReviewQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildAdminReviewWhere(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: adminReviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: adminReviewInclude,
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return review;
};

export const updateAdminReviewStatus = async (
  reviewId: string,
  input: UpdateReviewStatusInput,
) => {
  await getAdminReviewById(reviewId);

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: input.status,
    },
    include: adminReviewInclude,
  });
};
