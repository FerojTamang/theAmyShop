export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: AuthUser;
  tokens: AuthTokens;
};
