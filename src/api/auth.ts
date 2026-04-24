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
    // TODO backend: add `hue` field to user model (number, default random 0-360)
    hue: d.hue ?? 220,
    preferences: d.preferences,
  };
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}
