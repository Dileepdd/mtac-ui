import { apiClient } from "./client";

// ─── List ─────────────────────────────────────────────────────────────────────

export interface WorkspaceListItem {
  _id: string;
  name: string;
  slug: string;
  created_at: string;
  memberCount: number;
  role: {
    _id: string;
    name: string;
    level: number;
    is_system: boolean;
    permissions: string[];
  };
}

export interface WorkspaceListResponse {
  data: WorkspaceListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function listWorkspacesApi(page = 1, limit = 50): Promise<WorkspaceListResponse> {
  const res = await apiClient.get<WorkspaceListResponse>("/workspace", { params: { page, limit } });
  return res.data;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createWorkspaceApi(name: string): Promise<{ _id: string; name: string; slug: string }> {
  const res = await apiClient.post<{ data: { _id: string; name: string; slug: string } }>("/workspace/create", { name });
  return res.data.data;
}

// ─── Get ──────────────────────────────────────────────────────────────────────

export interface WorkspaceDetail {
  _id: string;
  name: string;
  slug: string;
  settings: {
    accent?: string;
    font?: string;
    density?: string;
    timezone?: string;
    date_format?: string;
  };
  created_by: string;
  created_at: string;
}

export async function getWorkspaceApi(workspaceId: string): Promise<WorkspaceDetail> {
  const res = await apiClient.get<{ data: WorkspaceDetail }>(`/workspace/${workspaceId}`);
  return res.data.data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateWorkspaceApi(
  workspaceId: string,
  body: {
    name?: string;
    settings?: {
      accent?: string;
      font?: string;
      density?: string;
      timezone?: string;
      date_format?: string;
    };
  }
): Promise<WorkspaceDetail> {
  const res = await apiClient.patch<{ data: WorkspaceDetail }>(`/workspace/${workspaceId}`, body);
  return res.data.data;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface WorkspaceStats {
  projectCount:       number;
  openTaskCount:      number;
  completedThisWeek:  number;
  memberCount:        number;
}

export async function getWorkspaceStatsApi(workspaceId: string): Promise<WorkspaceStats> {
  const res = await apiClient.get<{ data: WorkspaceStats }>(`/workspace/${workspaceId}/stats`);
  return res.data.data;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface ActivityItem {
  _id: string;
  actor_id:    string;
  actor_name:  string;
  verb:        string;
  target:      string;
  target_type: string;
  to?:         string;
  created_at:  string;
}

export async function getWorkspaceActivityApi(workspaceId: string, limit = 30): Promise<ActivityItem[]> {
  const res = await apiClient.get<{ data: ActivityItem[] }>(`/workspace/${workspaceId}/activity`, { params: { limit } });
  return res.data.data;
}

// ─── My tasks (cross-project) ─────────────────────────────────────────────────

export async function deleteWorkspaceApi(workspaceId: string): Promise<void> {
  await apiClient.delete(`/workspace/${workspaceId}`);
}

export async function getMyTasksApi(workspaceId: string, status?: string): Promise<any[]> {
  const res = await apiClient.get<{ data: any[] }>(`/workspace/${workspaceId}/my-tasks`, {
    params: status ? { status } : {},
  });
  return res.data.data;
}
