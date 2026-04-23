import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

// CmdK (Phase 11) and TaskModal (Phase 8) overlays will be mounted here

export default function AppShell() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
