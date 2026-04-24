import { apiClient } from "./client";

export interface CommentItem {
  _id:       string;
  body:      string;
  author_id: { _id: string; name: string; email: string; hue: number };
  created_at: string;
  updated_at: string;
}

export async function getCommentsApi(workspaceId: string, projectId: string, taskId: string): Promise<CommentItem[]> {
  const res = await apiClient.get<{ data: CommentItem[] }>(
    `/workspace/${workspaceId}/project/${projectId}/task/${taskId}/comments`
  );
  return res.data.data;
}

export async function addCommentApi(
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: string
): Promise<CommentItem> {
  const res = await apiClient.post<{ data: CommentItem }>(
    `/workspace/${workspaceId}/project/${projectId}/task/${taskId}/comments`,
    { body }
  );
  return res.data.data;
}
