import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { apiClient } from "../api/client";
import * as authApi from "../api/authApi";
import type { UserInfo } from "../api/types";

const REFRESH_TOKEN_KEY = "ese_refresh_token";
const USER_KEY = "ese_user";

export interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedRefreshToken) {
      authApi
        .refresh(storedRefreshToken)
        .then((tokens) => {
          apiClient.setToken(tokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        })
        .catch(() => {
          // Refresh failed — clear stored data
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          apiClient.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    apiClient.setToken(response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    apiClient.setToken(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
