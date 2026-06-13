import type { AccountStatus, UserRole } from "../../../generated/prisma/client.js";

export type SafeAccountUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};
