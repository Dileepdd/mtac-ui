import { apiClient } from "./client";

export interface ProjectListItem {
  _id:        string;
  name:       string;
  key:        string;
  color:      string;
  taskCount:  number;
  done:       number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  data: ProjectListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function listProjectsApi(workspaceId: string, page = 1, limit = 50): Promise<ProjectListResponse> {
  const res = await apiClient.get<ProjectListResponse>(
    `/workspace/${workspaceId}/project`,
    { params: { page, limit } }
  );
  return res.data;
}

export async function getProjectApi(workspaceId: string, projectId: string): Promise<ProjectListItem> {
  const res = await apiClient.get<{ data: ProjectListItem }>(
    `/workspace/${workspaceId}/project/${projectId}`
  );
  return res.data.data;
}

export async function createProjectApi(
  workspaceId: string,
  body: { name: string; key?: string; color?: string }
): Promise<ProjectListItem> {
  const res = await apiClient.post<{ data: ProjectListItem }>(
    `/workspace/${workspaceId}/project`,
    body
  );
  return res.data.data;
}

export async function updateProjectApi(
  workspaceId: string,
  projectId: string,
  body: { name?: string; color?: string }
): Promise<ProjectListItem> {
  const res = await apiClient.patch<{ data: ProjectListItem }>(
    `/workspace/${workspaceId}/project/${projectId}`,
    body
  );
  return res.data.data;
}

export async function deleteProjectApi(workspaceId: string, projectId: string): Promise<void> {
  await apiClient.delete(`/workspace/${workspaceId}/project/${projectId}`);
}
