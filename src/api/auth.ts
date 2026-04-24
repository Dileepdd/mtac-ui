import { apiClient } from "./client";
import type { User } from "@/types/domain";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export async function loginApi(data: LoginDTO): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiClient.post<{ data: { accessToken: string; refreshToken: string } }>("/auth/login", data);
  return res.data.data;
}

export async function registerApi(data: RegisterDTO): Promise<void> {
  await apiClient.post("/auth/register", data);
}

export async function getProfileApi(token: string): Promise<User> {
  const res = await apiClient.get<{ data: Record<string, any> }>("/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = res.data.data;
  return {
    _id: String(d._id),
    name: d.name,
    email: d.email,
    hue: d.hue ?? 220,
    preferences: d.preferences,
  };
}

export async function verifyEmailApi(email: string, otp: string): Promise<void> {
  await apiClient.post("/auth/verify-email", { email, otp });
}

export async function resendOtpApi(email: string): Promise<void> {
  await apiClient.post("/auth/resend-otp", { email });
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await apiClient.post(`/auth/reset-password/${token}`, { newPassword });
}

export interface InviteInfo {
  workspaceName: string;
  inviterName: string;
  email: string;
  expiresAt: string;
}

export async function getInviteInfoApi(token: string): Promise<InviteInfo> {
  const res = await apiClient.get<{ data: InviteInfo }>(`/auth/invite-info/${token}`);
  return res.data.data;
}

export async function acceptInviteApi(token: string): Promise<{ workspaceId: string }> {
  const res = await apiClient.post<{ data: { workspaceId: string } }>(`/auth/accept-invite/${token}`);
  return res.data.data;
}
