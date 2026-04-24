import type { UserPreferences, WorkspaceSettings } from "@/config/colors";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "urgent" | "high" | "med" | "low" | "none";

export interface User {
  _id: string;
  name: string;
  email: string;
  hue?: number;
  preferences?: UserPreferences;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  created_by: string;
  settings?: WorkspaceSettings;
}

export interface WorkspaceMember {
  _id: string;
  user: User;
  workspace_id: string;
  role_id: string;
  joined_at: string;
}

export interface Role {
  _id: string;
  name: string;
  level: number;
  permissions: string[];
  workspace_id: string;
  is_system: boolean;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  color: string;
  workspace_id: string;
  taskCount?: number;
  done?: number;
  updated?: string;
}

export interface Task {
  _id: string;
  key: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: User;
  project_id: string;
  workspace_id: string;
  labels: string[];
  due?: string;
  comments?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  _id: string;
  body: string;
  author: User;
  task_id: string;
  created_at: string;
}

export interface ActivityEvent {
  _id: string;
  actor: string;
  verb: string;
  target: string;
  to?: string;
  time: string;
}
