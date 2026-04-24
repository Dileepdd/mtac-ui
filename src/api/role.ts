import { apiClient } from "./client";

export interface RoleItem {
  _id: string;
  name: string;
  level: number;
  all_permissions: boolean;
  permissions: { _id: string; name: string }[];
}

export async function listRolesApi(workspaceId: string): Promise<RoleItem[]> {
  const res = await apiClient.get<{ data: RoleItem[] }>(`/workspace/${workspaceId}/role`);
  return res.data.data;
}

export async function updateRolePermissionsApi(
  workspaceId: string,
  roleId: string,
  permissions: string[]
): Promise<RoleItem> {
  const res = await apiClient.patch<{ data: RoleItem }>(
    `/workspace/${workspaceId}/role/${roleId}/permissions`,
    { permissions }
  );
  return res.data.data;
}
