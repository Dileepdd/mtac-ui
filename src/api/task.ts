import { apiClient } from "./client";
import type { TaskStatus, TaskPriority } from "@/types/domain";

export interface BackendTask {
  _id:          string;
  key:          string;
  title:        string;
  description?: string;
  status:       TaskStatus;
  priority:     TaskPriority;
  labels:       string[];
  due?:         string | null;
  assigned_to?: { _id: string; name: string; email?: string } | null;
  project_id:   string;
  workspace_id: string;
  created_by:   string;
  created_at:   string;
  updated_at:   string;
}

export interface TaskListResponse {
  data: BackendTask[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function listTasksApi(workspaceId: string, projectId: string, page = 1, limit = 100): Promise<TaskListResponse> {
  const res = await apiClient.get<TaskListResponse>(
    `/workspace/${workspaceId}/project/${projectId}/task`,
    { params: { page, limit } }
  );
  return res.data;
}

export async function getTaskApi(workspaceId: string, projectId: string, taskId: string): Promise<BackendTask> {
  const res = await apiClient.get<{ data: BackendTask }>(
    `/workspace/${workspaceId}/project/${projectId}/task/${taskId}`
  );
  return res.data.data;
}

export async function createTaskApi(
  workspaceId: string,
  projectId: string,
  body: {
    title:        string;
    description?: string;
    assigned_to?: string;
    priority?:    TaskPriority;
    labels?:      string[];
    due?:         string;
  }
): Promise<BackendTask> {
  const res = await apiClient.post<{ data: BackendTask }>(
    `/workspace/${workspaceId}/project/${projectId}/task`,
    body
  );
  return res.data.data;
}

export async function updateTaskApi(
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title?:       string;
    description?: string;
    status?:      TaskStatus;
    priority?:    TaskPriority;
    labels?:      string[];
    due?:         string | null;
  }
): Promise<BackendTask> {
  const res = await apiClient.patch<{ data: BackendTask }>(
    `/workspace/${workspaceId}/project/${projectId}/task/${taskId}`,
    body
  );
  return res.data.data;
}

export async function deleteTaskApi(workspaceId: string, projectId: string, taskId: string): Promise<void> {
  await apiClient.delete(`/workspace/${workspaceId}/project/${projectId}/task/${taskId}`);
}
