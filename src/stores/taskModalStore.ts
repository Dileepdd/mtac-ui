import { create } from "zustand";
import type { Task } from "@/types/domain";

interface TaskModalState {
  task: Task | null;
  open: boolean;
  openTask: (task: Task | null) => void;
  closeTask: () => void;
}

export const useTaskModalStore = create<TaskModalState>()((set) => ({
  task: null,
  open: false,
  openTask: (task) => set({ task, open: true }),
  closeTask: () => set({ task: null, open: false }),
}));
