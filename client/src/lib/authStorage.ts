import type { AuthTokens } from "../types/auth";

const ACCESS_TOKEN_KEY = "amy_access_token";
const REFRESH_TOKEN_KEY = "amy_refresh_token";

type AuthStorageListener = (tokens: AuthTokens | null) => void;

const listeners = new Set<AuthStorageListener>();

const notifyListeners = (tokens: AuthTokens | null) => {
  listeners.forEach((listener) => listener(tokens));
};

export const authStorage = {
  getTokens(): AuthTokens | null {
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },
  setTokens(tokens: AuthTokens) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    notifyListeners(tokens);
  },
  clearTokens() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyListeners(null);
  },
  subscribe(listener: AuthStorageListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
