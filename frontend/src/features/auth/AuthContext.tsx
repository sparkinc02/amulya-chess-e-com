import { ApiResponse, AuthResponse, UserData } from "@/lib/types";
import { isAxiosError, AxiosError } from "axios";
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useLogoutUser, useRefreshUser } from "./authService";
import { AUTH_TOKEN_REFRESHED } from "@/config/axios";

interface AuthContextType {
  user: UserData | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuthData: (user: UserData, accessToken: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateAddress: (address: UserData['address']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { mutate: logoutMutate } = useLogoutUser();
  const { mutate: refreshMutate } = useRefreshUser();

  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");
  }, [accessToken]);

  const setAuthData = useCallback((userData: UserData, token: string) => {
    setUser(userData);
    setAccessToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }, []);

  const updateAddress = useCallback((address: UserData['address']) => {
    setUser((prev) => prev ? { ...prev, address } : null);
  }, []);

  const refreshToken = useCallback(async () => {
    refreshMutate(undefined, {
      onError: (error: Error) => {
        if (isAxiosError(error)) {
          const data = (error as AxiosError).response?.data as ApiResponse<void>;
          if (data?.message) { toast.error(data.message); clearAuth(); return; }
        }
        toast.error("Something went wrong. Please try again.");
        clearAuth();
      },
      onSuccess: (response) => {
        if (response.data) { setUser(response.data.user); setAccessToken(response.data.accessToken); }
        toast.success(response.message);
      },
    });
  }, [clearAuth, refreshMutate]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      if (user) await refreshToken();
      setIsLoading(false);
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const { user: refreshedUser, accessToken: newToken } = (e as CustomEvent).detail;
      if (refreshedUser) setUser(refreshedUser);
      if (newToken) setAccessToken(newToken);
    };
    window.addEventListener(AUTH_TOKEN_REFRESHED, handleTokenRefreshed);
    return () => window.removeEventListener(AUTH_TOKEN_REFRESHED, handleTokenRefreshed);
  }, []);

  const logout = async (): Promise<void> => {
    logoutMutate(undefined, {
      onError: (error: Error) => {
        if (isAxiosError(error)) {
          const data = (error as AxiosError).response?.data as ApiResponse<AuthResponse>;
          if (data?.message) { toast.error(data.message); return; }
        }
        toast.error("Something went wrong. Please try again.");
      },
      onSuccess: (response) => { clearAuth(); toast.success(response.message); },
    });
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setAuthData, clearAuth, logout, refresh: refreshToken, updateAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
