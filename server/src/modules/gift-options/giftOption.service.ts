import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  GiftOptionQueryInput,
  UpdateGiftPrintStatusInput,
} from "./giftOption.validation.js";

const giftOptionInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
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
    },
  },
} as const;

export const listGiftOptions = async (query: GiftOptionQueryInput) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...(query.printStatus && { printStatus: query.printStatus }),
  };

  const [giftOptions, total] = await Promise.all([
    prisma.giftOption.findMany({
      where,
      include: giftOptionInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.giftOption.count({ where }),
  ]);

  return {
    giftOptions,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getGiftOptionById = async (id: string) => {
  const giftOption = await prisma.giftOption.findUnique({
    where: { id },
    include: giftOptionInclude,
  });

  if (!giftOption) {
    throw new ApiError(404, "Gift option not found");
  }

  return giftOption;
};

export const updateGiftOptionPrintStatus = async (
  id: string,
  input: UpdateGiftPrintStatusInput,
) => {
  const existingGiftOption = await prisma.giftOption.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingGiftOption) {
    throw new ApiError(404, "Gift option not found");
  }

  return prisma.giftOption.update({
    where: { id },
    data: {
      printStatus: input.printStatus,
    },
    include: giftOptionInclude,
  });
};
