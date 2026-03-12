import { api } from "@/config/axios";
import { ApiResponse, AuthResponse, LoginInput, SignupInput } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

interface VerifyEmailRequest { otp: string; token: string; }
interface ForgotPasswordRequest { email: string; }
interface ResetPasswordRequest { newPassword: string; token: string; }
interface SendVerificationEmailRequest { email: string; }
export interface VerifyEmailResponse { email: string; }
export interface SendOtpResponse { otpToken: string; }
export interface GoogleLoginInput { token: string; }

export const signupUser = async (data: SignupInput) => {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", data);
  return response.data;
};
export const loginUser = async (data: LoginInput) => {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return response.data;
};
export const googleLoginUser = async (data: GoogleLoginInput) => {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/google", data);
  return response.data;
};
export const logoutUser = async () => {
  const response = await api.post<ApiResponse<void>>("/auth/logout");
  return response.data;
};
export const refreshUser = async () => {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/refresh");
  return response.data;
};
const sendVerificationEmail = async (data: SendVerificationEmailRequest) => {
  const response = await api.post<ApiResponse<SendOtpResponse>>("/auth/send-otp", data);
  return response.data;
};
const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await api.post<ApiResponse<void>>(`/auth/reset-password/${data.token}`, { newPassword: data.newPassword });
  return response.data;
};
const verifyEmailCode = async (data: VerifyEmailRequest) => {
  const response = await api.post<ApiResponse<VerifyEmailResponse>>("/auth/verify-email", data);
  return response.data;
};
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await api.post<ApiResponse<void>>("/auth/forgot-password", data);
  return response.data;
};

export const useSignupUser = () => useMutation({ mutationFn: signupUser });
export const useLoginUser = () => useMutation({ mutationFn: loginUser });
export const useGoogleLoginUser = () => useMutation({ mutationFn: googleLoginUser });
export const useLogoutUser = () => useMutation({ mutationFn: logoutUser });
export const useRefreshUser = () => useMutation({ mutationFn: refreshUser });
export const useSendVerificationEmail = () => useMutation({ mutationFn: sendVerificationEmail });
export const useVerifyEmail = () => useMutation({ mutationFn: verifyEmailCode });
export const useForgotPassword = () => useMutation({ mutationFn: forgotPassword });
export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
