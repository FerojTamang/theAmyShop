import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi } from "../services/authApi";
import type { AuthTokens, AuthUser } from "../types/auth";
import { authStorage } from "../lib/authStorage";

type LoginInput = {
  identifier: string;
  password: string;
};

type RegisterInput = {
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  referralCode?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() =>
    authStorage.getTokens(),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(tokens));

  useEffect(() => {
    return authStorage.subscribe((nextTokens) => {
      setTokens(nextTokens);

      if (!nextTokens) {
        setUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  const storeSession = useCallback((nextUser: AuthUser, nextTokens: AuthTokens) => {
    authStorage.setTokens(nextTokens);
    setTokens(nextTokens);
    setUser(nextUser);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!authStorage.getTokens()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      authStorage.clearTokens();
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      storeSession(result.user, result.tokens);
    },
    [storeSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authApi.register(input);
      storeSession(result.user, result.tokens);
    },
    [storeSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      authStorage.clearTokens();
      setTokens(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(tokens && user),
      isLoading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [isLoading, login, logout, refreshMe, register, tokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
