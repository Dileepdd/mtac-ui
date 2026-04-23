import { create } from "zustand";
import { applySettingsHierarchy } from "@/config/colors";
import { useAuthStore } from "./authStore";
import type { Workspace, Role } from "@/types/domain";

interface WorkspaceState {
  workspace: Workspace | null;
  userRole: Role | null;
  setWorkspace: (workspace: Workspace, role: Role) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  workspace: null,
  userRole: null,
  setWorkspace: (workspace, role) => {
    const user = useAuthStore.getState().user;
    applySettingsHierarchy(workspace.settings, user?.preferences);
    set({ workspace, userRole: role });
  },
  clearWorkspace: () => {
    const user = useAuthStore.getState().user;
    applySettingsHierarchy(undefined, user?.preferences);
    set({ workspace: null, userRole: null });
  },
}));
