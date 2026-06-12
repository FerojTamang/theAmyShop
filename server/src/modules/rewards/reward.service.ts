import {
  RewardTransactionType,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  AdjustRewardInput,
  RewardTransactionQueryInput,
  RewardWalletQueryInput,
} from "./reward.validation.js";

type RewardClient = Prisma.TransactionClient | typeof prisma;

const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
} as const;

const walletInclude = {
  user: {
    select: safeUserSelect,
  },
} as const;

const transactionInclude = {
  user: {
    select: safeUserSelect,
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      orderStatus: true,
      paymentStatus: true,
      createdAt: true,
    },
  },
} as const;

const ensureUserExists = async (
  client: RewardClient,
  userId: string,
): Promise<void> => {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
};

const getOrCreateWalletRecord = async (
  client: RewardClient,
  userId: string,
) => {
  await ensureUserExists(client, userId);

  return client.rewardWallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
    },
    include: walletInclude,
  });
};

const buildTransactionWhere = (
  query: RewardTransactionQueryInput,
): Prisma.RewardTransactionWhereInput => ({
  ...(query.userId && { userId: query.userId }),
  ...(query.orderId && { orderId: query.orderId }),
  ...(query.type && { type: query.type }),
});

export const getMyRewardWallet = async (userId: string) => {
  return getOrCreateWalletRecord(prisma, userId);
};

export const listMyRewardTransactions = async (
  userId: string,
  query: RewardTransactionQueryInput,
) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...buildTransactionWhere(query),
    userId,
  };

  const [transactions, total] = await Promise.all([
    prisma.rewardTransaction.findMany({
      where,
      include: transactionInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.rewardTransaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const listAdminRewardWallets = async (query: RewardWalletQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...(query.search && {
      user: {
        OR: [
          { fullName: { contains: query.search, mode: "insensitive" as const } },
          { email: { contains: query.search, mode: "insensitive" as const } },
          { phone: { contains: query.search, mode: "insensitive" as const } },
        ],
      },
    }),
  };

  const [wallets, total] = await Promise.all([
    prisma.rewardWallet.findMany({
      where,
      include: walletInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.rewardWallet.count({ where }),
  ]);

  return {
    wallets,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminRewardWalletByUserId = async (userId: string) => {
  return getOrCreateWalletRecord(prisma, userId);
};

export const listAdminRewardTransactions = async (
  query: RewardTransactionQueryInput,
) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildTransactionWhere(query);

  const [transactions, total] = await Promise.all([
    prisma.rewardTransaction.findMany({
      where,
      include: transactionInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.rewardTransaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const adjustRewardWallet = async (input: AdjustRewardInput) => {
  return prisma.$transaction(async (tx) => {
    await getOrCreateWalletRecord(tx, input.userId);

    if (input.gems < 0) {
      const gemsToSubtract = Math.abs(input.gems);
      const updateResult = await tx.rewardWallet.updateMany({
        where: {
          userId: input.userId,
          balance: {
            gte: gemsToSubtract,
          },
        },
        data: {
          balance: {
            decrement: gemsToSubtract,
          },
          lifetimeSpent: {
            increment: gemsToSubtract,
          },
        },
      });

      if (updateResult.count !== 1) {
        throw new ApiError(400, "Reward wallet balance cannot become negative");
      }
    } else {
      await tx.rewardWallet.update({
        where: { userId: input.userId },
        data: {
          balance: {
            increment: input.gems,
          },
          lifetimeEarned: {
            increment: input.gems,
          },
        },
      });
    }

    const transaction = await tx.rewardTransaction.create({
      data: {
        userId: input.userId,
        type: RewardTransactionType.ADMIN_ADJUSTMENT,
        gems: input.gems,
        description: input.description,
      },
      include: transactionInclude,
    });

    const wallet = await tx.rewardWallet.findUniqueOrThrow({
      where: { userId: input.userId },
      include: walletInclude,
    });

    return {
      wallet,
      transaction,
    };
  });
};
