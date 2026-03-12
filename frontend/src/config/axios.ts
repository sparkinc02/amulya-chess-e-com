import axios, { AxiosError, isAxiosError } from "axios";
import { refreshUser } from "@/features/auth/authService";
import { toast } from "sonner";
import { ApiResponse, AuthResponse } from "@/lib/types";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

// Attach access token from localStorage on every request
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Silent token refresh with queue
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const AUTH_TOKEN_REFRESHED = "auth:token_refreshed";

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthMiddleware401 =
      error.response?.status === 401 &&
      error.response?.headers?.["x-auth-error"];

    if (
      !isAuthMiddleware401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh"
    ) {
      if (isAuthMiddleware401) {
        toast.error(error.response?.data?.message || "Unauthorized access", { id: "session-expired" });
        setTimeout(() => { window.location.href = "/login"; }, 1000);
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await refreshUser();
      if (!res?.data?.accessToken) {
        toast.error(res.message || "Session expired", { id: "session-expired" });
        localStorage.removeItem("accessToken");
        setTimeout(() => { window.location.href = "/login"; }, 1000);
        return Promise.reject(res);
      }
      const newAccessToken = res.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      window.dispatchEvent(new CustomEvent(AUTH_TOKEN_REFRESHED, { detail: { user: res.data.user, accessToken: newAccessToken } }));
      toast.success(res.message);
      processQueue(null, newAccessToken);
      return api(originalRequest);
    } catch (refreshError) {
      let errorMessage = "Something went wrong. Please try again.";
      if (isAxiosError(refreshError)) {
        const data = (refreshError as AxiosError).response?.data as ApiResponse<void>;
        if (data?.message) errorMessage = data.message;
      }
      toast.error(errorMessage, { id: "session-expired" });
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
