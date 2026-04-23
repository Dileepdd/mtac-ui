import { create } from "zustand";

interface CmdkState {
  open: boolean;
  openCmdK: () => void;
  closeCmdK: () => void;
  toggle: () => void;
}

export const useCmdkStore = create<CmdkState>()((set) => ({
  open: false,
  openCmdK: () => set({ open: true }),
  closeCmdK: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
