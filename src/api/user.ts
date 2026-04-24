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

export interface NotificationPrefs {
  assigned: boolean;
  mentions: boolean;
  comments: boolean;
  status:   boolean;
  weekly:   boolean;
}

export async function updatePreferencesApi(prefs: Partial<NotificationPrefs>): Promise<NotificationPrefs> {
  const res = await apiClient.patch<{ data: NotificationPrefs }>("/user/preferences", prefs);
  return res.data.data;
}

export async function updateAvatarApi(avatar: string): Promise<void> {
  await apiClient.post("/user/avatar", { avatar });
}

export async function deleteAccountApi(): Promise<void> {
  await apiClient.delete("/user/account");
}

export interface TokenItem {
  _id:          string;
  name:         string;
  prefix:       string;
  last_used_at?: string;
  created_at:   string;
}

export async function listTokensApi(): Promise<TokenItem[]> {
  const res = await apiClient.get<{ data: TokenItem[] }>("/user/tokens");
  return res.data.data;
}

export interface CreatedToken extends TokenItem {
  token: string;
}

export async function createTokenApi(name: string): Promise<CreatedToken> {
  const res = await apiClient.post<{ data: CreatedToken }>("/user/tokens", { name });
  return res.data.data;
}

export async function revokeTokenApi(tokenId: string): Promise<void> {
  await apiClient.delete(`/user/tokens/${tokenId}`);
}
