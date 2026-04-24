import { apiClient } from "./client";

export interface MemberItem {
  _id: string;
  user_id: { _id: string; name: string; email: string };
  role_id: { _id: string; name: string; level: number };
  created_at: string;
}

export interface MembersResponse {
  data: {
    self: MemberItem;
    members: MemberItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };
}

export async function listMembersApi(workspaceId: string, page = 1, limit = 50): Promise<MembersResponse> {
  const res = await apiClient.get<MembersResponse>(
    `/workspace-member/${workspaceId}`,
    { params: { page, limit } }
  );
  return res.data;
}

export async function updateMemberRoleApi(workspaceId: string, userId: string, roleId: string): Promise<void> {
  await apiClient.patch(`/workspace-member/${workspaceId}/update`, { userId, roleId });
}

export async function removeMemberApi(workspaceId: string, userId: string): Promise<void> {
  await apiClient.delete(`/workspace-member/${workspaceId}/remove`, { data: { userId } });
}

export async function inviteMemberApi(
  workspaceId: string,
  email: string,
  roleId?: string
): Promise<{ expiresAt: string; inviteLink: string }> {
  const res = await apiClient.post<{ data: { expiresAt: string; inviteLink: string } }>(
    `/workspace-member/${workspaceId}/invite`,
    { email, roleId }
  );
  return res.data.data;
}
