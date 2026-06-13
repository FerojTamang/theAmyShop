import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import type {
  ChangePasswordInput,
  UpdateAccountProfileInput,
} from "./account.validation.js";

const safeAccountSelect = {
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
} as const;

const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const ensurePhoneIsAvailable = async (
  userId: string,
  phone: string,
): Promise<void> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      phone,
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "Phone number is already registered");
  }
};

export const getMyAccountProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeAccountSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateMyAccountProfile = async (
  userId: string,
  input: UpdateAccountProfileInput,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const nextPhone = input.phone;
  const phoneChanged = nextPhone !== undefined && nextPhone !== existingUser.phone;

  if (phoneChanged) {
    await ensurePhoneIsAvailable(userId, nextPhone);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(input.fullName !== undefined && { fullName: input.fullName }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(phoneChanged && { phoneVerified: false }),
        },
      });

      if (input.profileImage !== undefined) {
        await tx.customerProfile.upsert({
          where: { userId },
          update: {
            profileImage: input.profileImage,
          },
          create: {
            userId,
            profileImage: input.profileImage,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: safeAccountSelect,
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(409, "Phone number is already registered");
    }

    throw error;
  }
};

export const changeMyPassword = async (
  userId: string,
  input: ChangePasswordInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordMatches = await comparePassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const isSamePassword = await comparePassword(
    input.newPassword,
    user.passwordHash,
  );

  if (isSamePassword) {
    throw new ApiError(400, "New password must be different from current password");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(input.newPassword),
    },
  });
};
