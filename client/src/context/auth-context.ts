import { createContext } from "react";
import type { AuthTokens, AuthUser } from "../types/auth";

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  referralCode?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
