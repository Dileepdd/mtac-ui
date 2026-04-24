import { create } from "zustand";
import type { Task } from "@/types/domain";

interface TaskModalState {
  task:             Task | null;
  open:             boolean;
  defaultProjectId: string | null;
  openTask:         (task: Task | null, defaultProjectId?: string | null) => void;
  closeTask:        () => void;
}

export const useTaskModalStore = create<TaskModalState>()((set) => ({
  task:             null,
  open:             false,
  defaultProjectId: null,
  openTask:         (task, defaultProjectId = null) => set({ task, open: true, defaultProjectId }),
  closeTask:        () => set({ task: null, open: false, defaultProjectId: null }),
}));
