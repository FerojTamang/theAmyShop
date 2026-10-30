import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi } from "../services/authApi";
import type { AuthTokens, AuthUser } from "../types/auth";
import { authStorage } from "../lib/authStorage";
import { AuthContext, type LoginInput, type RegisterInput, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: PropsWithChildren) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() =>
    authStorage.getTokens(),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(tokens));
  const refreshRequestId = useRef(0);
  const sessionOperationId = useRef(0);

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
    sessionOperationId.current += 1;
    refreshRequestId.current += 1;
    authStorage.setTokens(nextTokens);
    setTokens(nextTokens);
    setUser(nextUser);
  }, []);

  const refreshMe = useCallback(async () => {
    const requestId = refreshRequestId.current + 1;
    refreshRequestId.current = requestId;

    if (!authStorage.getTokens()) {
      if (refreshRequestId.current === requestId) setIsLoading(false);
      return;
    }

    try {
      if (refreshRequestId.current === requestId) setIsLoading(true);
      const currentUser = await authApi.me();
      if (refreshRequestId.current === requestId) setUser(currentUser);
    } catch {
      if (refreshRequestId.current === requestId) {
        authStorage.clearTokens();
        setTokens(null);
        setUser(null);
      }
    } finally {
      if (refreshRequestId.current === requestId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) void refreshMe();
    });

    return () => {
      isActive = false;
      refreshRequestId.current += 1;
    };
  }, [refreshMe]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      storeSession(result.user, result.tokens);
      return result.user;
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
    const operationId = sessionOperationId.current + 1;
    sessionOperationId.current = operationId;
    try {
      await authApi.logout();
    } finally {
      if (sessionOperationId.current === operationId) {
        refreshRequestId.current += 1;
        authStorage.clearTokens();
        setTokens(null);
        setUser(null);
      }
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
