import {
  Prisma,
  ReferralStatus,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateReferralCode } from "../../utils/generateReferralCode.js";
import type { ReferralDirection } from "./referral.types.js";
import type {
  ApplyReferralInput,
  ReferralQueryInput,
  UpdateReferralStatusInput,
} from "./referral.validation.js";

const MAX_REFERRAL_CODE_ATTEMPTS = 8;

const publicUserSelect = {
  id: true,
  fullName: true,
} as const;

const adminUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
} as const;

const referralCodeSelect = {
  id: true,
  code: true,
  totalReferrals: true,
  successfulReferrals: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const publicReferralInclude = {
  referrerUser: {
    select: publicUserSelect,
  },
  referredUser: {
    select: publicUserSelect,
  },
  referralCode: {
    select: referralCodeSelect,
  },
  qualifyingOrder: {
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      createdAt: true,
    },
  },
} as const;

const adminReferralInclude = {
  referrerUser: {
    select: adminUserSelect,
  },
  referredUser: {
    select: adminUserSelect,
  },
  referralCode: {
    select: referralCodeSelect,
  },
  qualifyingOrder: {
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
    },
  },
} as const;

const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const createUniqueReferralCode = async (userId: string) => {
  for (let attempt = 0; attempt < MAX_REFERRAL_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.referralCode.create({
        data: {
          userId,
          code: generateReferralCode(),
        },
        select: referralCodeSelect,
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw new ApiError(500, "Unable to generate unique referral code");
};

const buildAdminReferralWhere = (
  query: ReferralQueryInput,
): Prisma.ReferralWhereInput => ({
  ...(query.status && { status: query.status }),
  ...(query.referrerUserId && { referrerUserId: query.referrerUserId }),
  ...(query.referredUserId && { referredUserId: query.referredUserId }),
});

const withDirection = <
  T extends {
    referrerUserId: string;
    referredUserId: string;
  },
>(
  userId: string,
  referral: T,
): T & { direction: ReferralDirection } => ({
  ...referral,
  direction: referral.referrerUserId === userId ? "MADE" : "RECEIVED",
});

export const getOrCreateMyReferralCode = async (userId: string) => {
  const existingCode = await prisma.referralCode.findUnique({
    where: { userId },
    select: referralCodeSelect,
  });

  if (existingCode) {
    return existingCode;
  }

  return createUniqueReferralCode(userId);
};

export const applyReferralCode = async (
  userId: string,
  input: ApplyReferralInput,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const referralCode = await tx.referralCode.findFirst({
        where: {
          code: input.code,
          isActive: true,
        },
        select: {
          id: true,
          userId: true,
          code: true,
        },
      });

      if (!referralCode) {
        throw new ApiError(404, "Referral code is invalid or inactive");
      }

      if (referralCode.userId === userId) {
        throw new ApiError(400, "Self-referral is not allowed");
      }

      const existingReferral = await tx.referral.findUnique({
        where: { referredUserId: userId },
        select: { id: true },
      });

      if (existingReferral) {
        throw new ApiError(409, "Referral code has already been applied");
      }

      const referral = await tx.referral.create({
        data: {
          referrerUserId: referralCode.userId,
          referredUserId: userId,
          referralCodeId: referralCode.id,
          status: ReferralStatus.REGISTERED,
        },
        include: publicReferralInclude,
      });

      await tx.referralCode.update({
        where: { id: referralCode.id },
        data: {
          totalReferrals: {
            increment: 1,
          },
        },
      });

      return referral;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(409, "Referral code has already been applied");
    }

    throw error;
  }
};

export const listMyReferrals = async (
  userId: string,
  query: ReferralQueryInput,
) => {
  const skip = (query.page - 1) * query.limit;
  const where: Prisma.ReferralWhereInput = {
    ...buildAdminReferralWhere(query),
    OR: [{ referrerUserId: userId }, { referredUserId: userId }],
  };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      include: publicReferralInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    referrals: referrals.map((referral) => withDirection(userId, referral)),
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const listAdminReferrals = async (query: ReferralQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildAdminReferralWhere(query);

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      include: adminReferralInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    referrals,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const updateAdminReferralStatus = async (
  referralId: string,
  input: UpdateReferralStatusInput,
) => {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    select: { id: true },
  });

  if (!referral) {
    throw new ApiError(404, "Referral not found");
  }

  return prisma.referral.update({
    where: { id: referralId },
    data: {
      status: input.status,
    },
    include: adminReferralInclude,
  });
};
