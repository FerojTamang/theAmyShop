import type { UserRole } from "../../../generated/prisma/client.js";

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

export type SafeUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthPayload = {
  userId: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}
