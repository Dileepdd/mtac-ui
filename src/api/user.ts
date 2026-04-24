import { apiClient } from "./client";
import type { User } from "@/types/domain";

export async function getProfileApi(): Promise<User> {
  const res = await apiClient.get<{ data: Record<string, any> }>("/user/profile");
  const d = res.data.data;
  return {
    _id:         String(d._id),
    name:        d.name,
    email:       d.email,
    hue:         d.hue ?? 220,
    preferences: d.preferences,
  };
}

export async function updateProfileApi(name: string): Promise<User> {
  const res = await apiClient.patch<{ data: Record<string, any> }>("/user/profile", { name });
  const d = res.data.data;
  return {
    _id:         String(d._id),
    name:        d.name,
    email:       d.email,
    hue:         d.hue ?? 220,
    preferences: d.preferences,
  };
}

export async function updatePasswordApi(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.patch("/user/password", { currentPassword, newPassword });
}
