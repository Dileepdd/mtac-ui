import { apiClient } from "./client";

export interface PermissionItem {
  name: string;
}

export async function listPermissionsApi(): Promise<PermissionItem[]> {
  const res = await apiClient.get<{ data: PermissionItem[] }>("/permissions");
  return res.data.data;
}
