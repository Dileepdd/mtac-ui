import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCmdkStore } from "@/stores/cmdkStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { applyTheme } from "@/config/colors";

export function useKeyboardShortcuts() {
  const navigate   = useNavigate();
  const { slug }   = useParams<{ slug: string }>();
  const openCmdK   = useCmdkStore((s) => s.openCmdK);
  const closeCmdK  = useCmdkStore((s) => s.closeCmdK);
  const cmdkOpen   = useCmdkStore((s) => s.open);
  const openTask   = useTaskModalStore((s) => s.openTask);
  const closeTask  = useTaskModalStore((s) => s.closeTask);
  const taskOpen   = useTaskModalStore((s) => s.open);
  const workspace  = useWorkspaceStore((s) => s.workspace);

  // Track "G" sequence — G+H, G+T, G+M, G+S
  const gPending = useRef(false);
  const gTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wsSlug = slug ?? workspace?._id ?? "";

    function isTyping(e: KeyboardEvent): boolean {
      const tag = (e.target as HTMLElement)?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    }

    function handle(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // ── ⌘K / Ctrl+K → toggle CmdK ─
      if (meta && e.key === "k") {
        e.preventDefault();
        cmdkOpen ? closeCmdK() : openCmdK();
        return;
      }

      // ── ESC → close any open overlay ─
      if (e.key === "Escape") {
        if (cmdkOpen) closeCmdK();
        if (taskOpen) closeTask();
        return;
      }

      // All shortcuts below require no modifier and no active input
      if (meta || e.altKey || isTyping(e)) return;

      // ── ⇧D → toggle dark/light theme ─
      if (e.shiftKey && e.key === "D") {
        const cur = document.documentElement.getAttribute("data-theme") ?? "light";
        applyTheme(cur === "light" ? "dark" : "light");
        return;
      }

      // ── ⇧P → new project (navigate to projects page) ─
      if (e.shiftKey && e.key === "P" && wsSlug) {
        navigate(`/w/${wsSlug}/projects`);
        return;
      }

      // ── ⇧I → invite member ─
      if (e.shiftKey && e.key === "I" && wsSlug) {
        navigate(`/w/${wsSlug}/members`);
        return;
      }

      if (e.shiftKey) return;

      // ── C → new task ─
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        openTask(null);
        return;
      }

      // ── ? → keyboard shortcuts page ─
      if (e.key === "?") {
        navigate("/settings#keyboard");
        return;
      }

      // ── G sequence (G then H/T/M/S) ─
      if (e.key === "g" || e.key === "G") {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { gPending.current = false; }, 1000);
        return;
      }

      if (gPending.current) {
        gPending.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        switch (e.key.toLowerCase()) {
          case "h": navigate(wsSlug ? `/w/${wsSlug}` : "/workspaces"); break;
          case "t": navigate(wsSlug ? `/w/${wsSlug}` : "/workspaces"); break; // TODO: "my tasks" view
          case "m": if (wsSlug) navigate(`/w/${wsSlug}/members`); break;
          case "s": navigate("/settings"); break;
        }
      }
    }

    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [navigate, slug, workspace, cmdkOpen, taskOpen, openCmdK, closeCmdK, openTask, closeTask]);
}
