import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TaskModal } from "@/features/tasks/components/TaskModal";
import { CmdK } from "@/components/overlays/CmdK";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function AppShell() {
  useKeyboardShortcuts();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <Outlet />
      </main>
      <TaskModal />
      <CmdK />
    </div>
  );
}
