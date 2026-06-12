import {
  AccountStatus,
  ReferralStatus,
  UserRole,
  type User,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import { generateReferralCode } from "../../utils/generateReferralCode.js";
import {
  generateAuthTokens,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import type { AuthTokens, SafeUser } from "./auth.types.js";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from "./auth.validation.js";

type AuthResult = {
  user: SafeUser;
  tokens: AuthTokens;
};

const safeUserSelect = {
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
} as const;

const toSafeUser = (user: Pick<User, keyof typeof safeUserSelect>): SafeUser => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const buildAuthResult = (user: SafeUser): AuthResult => {
  return {
    user,
    tokens: generateAuthTokens({
      userId: user.id,
      role: user.role,
    }),
  };
};

const ensureUniqueReferralCode = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode();
    const existingCode = await tx.referralCode.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existingCode) {
      return code;
    }
  }

  throw new ApiError(500, "Could not generate a unique referral code");
};

const normalizeEmail = (email: string | undefined): string | undefined => {
  return email ? email.toLowerCase() : undefined;
};

const isEmailIdentifier = (identifier: string): boolean => {
  return identifier.includes("@");
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const email = normalizeEmail(input.email);
  const phone = input.phone;

  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { phone },
        ...(email ? [{ email }] : []),
      ],
    },
    select: {
      email: true,
      phone: true,
    },
  });

  if (existingUsers.some((user) => user.phone === phone)) {
    throw new ApiError(409, "Phone number is already registered");
  }

  if (email && existingUsers.some((user) => user.email === email)) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const createdUser = await prisma.$transaction(async (tx) => {
      const referringCode = input.referralCode
        ? await tx.referralCode.findUnique({
            where: { code: input.referralCode },
            select: {
              id: true,
              userId: true,
              isActive: true,
            },
          })
        : null;

      if (input.referralCode && (!referringCode || !referringCode.isActive)) {
        throw new ApiError(400, "Referral code is invalid");
      }

      const user = await tx.user.create({
        data: {
          fullName: input.fullName,
          email: email ?? null,
          phone,
          passwordHash,
          role: UserRole.CUSTOMER,
          status: AccountStatus.ACTIVE,
        },
        select: safeUserSelect,
      });

      if (referringCode?.userId === user.id) {
        throw new ApiError(400, "Self-referral is not allowed");
      }

      await tx.rewardWallet.create({
        data: {
          userId: user.id,
        },
      });

      await tx.referralCode.create({
        data: {
          userId: user.id,
          code: await ensureUniqueReferralCode(tx),
        },
      });

      if (referringCode) {
        await tx.referral.create({
          data: {
            referrerUserId: referringCode.userId,
            referredUserId: user.id,
            referralCodeId: referringCode.id,
            status: ReferralStatus.REGISTERED,
            rewardGiven: false,
          },
        });
      }

      return user;
    });

    return buildAuthResult(toSafeUser(createdUser));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ApiError(409, "Email, phone, or referral code already exists");
    }

    throw error;
  }
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const identifier = input.identifier.trim();
  const where = isEmailIdentifier(identifier)
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };

  const user = await prisma.user.findFirst({
    where,
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status !== AccountStatus.ACTIVE) {
    throw new ApiError(403, "Account is not active");
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials");
  }

  return buildAuthResult(toSafeUser(user));
};

export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return toSafeUser(user);
};

export const refreshAuthToken = async (
  input: RefreshTokenInput,
): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(input.refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists");
  }

  if (user.status !== AccountStatus.ACTIVE) {
    throw new ApiError(403, "Account is not active");
  }

  return generateAuthTokens({
    userId: user.id,
    role: user.role,
  });
};
