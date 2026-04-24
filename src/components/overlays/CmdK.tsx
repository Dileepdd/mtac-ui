import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCmdkStore } from "@/stores/cmdkStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { listProjectsApi } from "@/api/project";
import { applyTheme } from "@/config/colors";
import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import { StatusDot, I } from "@/icons";
import { idToColor, deriveKey } from "./cmdk-utils";

// helpers used in ProjectGlyph — exported so keyboard shortcuts can also use them
export { idToColor, deriveKey };

const GROUP_LABELS: Record<string, string> = {
  nav:     "Navigation",
  action:  "Actions",
  project: "Projects",
  task:    "Tasks",
};

interface CmdItem {
  type:    "nav" | "action" | "project" | "task";
  label:   string;
  hint?:   string;
  icon:    React.ReactNode;
  run:     () => void;
}

export function CmdK() {
  const navigate      = useNavigate();
  const { slug }      = useParams<{ slug: string }>();
  const { open, closeCmdK }  = useCmdkStore();
  const workspace     = useWorkspaceStore((s) => s.workspace);
  const openTask      = useTaskModalStore((s) => s.openTask);

  const [q, setQ]     = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef      = useRef<HTMLInputElement>(null);

  // Focus + reset on open
  useEffect(() => {
    if (!open) return;
    setQ(""); setIdx(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Projects from cache
  const { data } = useQuery({
    queryKey: ["projects", workspace?._id],
    queryFn: () => listProjectsApi(workspace!._id),
    enabled: !!workspace,
  });
  const projects = data?.data ?? [];

  // Build item list
  const base: CmdItem[] = useMemo(() => {
    const wsSlug = slug ?? workspace?._id ?? "";
    const nav: CmdItem[] = [
      { type: "nav", label: "Go to Home",      hint: "G H", icon: I.home({ size: 13 }), run: () => navigate(`/w/${wsSlug}`) },
      { type: "nav", label: "Go to Members",   hint: "G M", icon: I.users({ size: 13 }), run: () => navigate(`/w/${wsSlug}/members`) },
      { type: "nav", label: "Go to Settings",  hint: "G S", icon: I.settings({ size: 13 }), run: () => navigate(`/settings`) },
    ];
    const actions: CmdItem[] = [
      { type: "action", label: "New task",       hint: "C",    icon: I.plus({ size: 13 }), run: () => openTask(null) },
      { type: "action", label: "New project",    hint: "⇧ P",  icon: I.folder?.({ size: 13 }), run: () => navigate(`/w/${wsSlug}/projects`) },
      { type: "action", label: "Invite member",  hint: "⇧ I",  icon: I.users({ size: 13 }), run: () => navigate(`/w/${wsSlug}/members`) },
      { type: "action", label: "Toggle theme",   hint: "⇧ D",  icon: I.moon?.({ size: 13 }), run: () => {
        const cur = document.documentElement.getAttribute("data-theme") ?? "light";
        applyTheme(cur === "light" ? "dark" : "light");
      }},
    ];
    const projectItems: CmdItem[] = projects.map((p, i) => ({
      type: "project",
      label: p.name,
      hint: deriveKey(p.name),
      icon: <ProjectGlyph project={{ name: p.name, color: idToColor(p._id, i) }} size={14} />,
      run: () => navigate(`/w/${wsSlug}/p/${p._id}`),
    }));

    // TODO Phase 12: replace stub tasks with real recent assigned tasks query
    // GET /workspace/:id/tasks?assigned_to=me&sort=updated_at&limit=6
    const taskItems: CmdItem[] = [];

    return [...nav, ...actions, ...projectItems, ...taskItems];
  }, [slug, workspace, projects, navigate, openTask]);

  const items = useMemo(() => {
    if (!q) return base;
    const lower = q.toLowerCase();
    return base.filter((it) =>
      it.label.toLowerCase().includes(lower) ||
      it.hint?.toLowerCase().includes(lower)
    );
  }, [base, q]);

  // Reset selected index on query change
  useEffect(() => { setIdx(0); }, [q]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((x) => Math.min(items.length - 1, x + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((x) => Math.max(0, x - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); items[idx]?.run(); closeCmdK(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, items, idx, closeCmdK]);

  if (!open) return null;

  // Group items preserving order: nav, action, project, task
  const grouped: Record<string, (CmdItem & { globalIdx: number })[]> = {};
  let globalIdx = 0;
  for (const it of items) {
    const g = GROUP_LABELS[it.type];
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push({ ...it, globalIdx: globalIdx++ });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        background: "rgba(15,15,15,0.35)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh", animation: "fade-in 0.1s ease-out",
      }}
      onMouseDown={closeCmdK}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: 560, maxWidth: "92vw",
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
          overflow: "hidden", animation: "modal-in 0.14s ease-out",
        }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
          {I.search({ size: 15, style: { color: "var(--text-3)" } })}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, tasks, or run a command…"
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              fontSize: 14, color: "var(--text)",
            }}
          />
          <span className="kbd">ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 420, overflow: "auto", padding: 6 }}>
          {items.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-3)", fontSize: 12.5 }}>
              No results for "{q}"
            </div>
          )}
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <div style={{
                padding: "8px 10px 4px",
                fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)",
                textTransform: "uppercase", letterSpacing: 0.3,
              }}>
                {group}
              </div>
              {list.map((it) => (
                <button
                  key={it.globalIdx}
                  onClick={() => { it.run(); closeCmdK(); }}
                  onMouseEnter={() => setIdx(it.globalIdx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    height: 32, padding: "0 10px", borderRadius: 6,
                    background: idx === it.globalIdx ? "var(--bg-hover)" : "transparent",
                    color: "var(--text)", fontSize: 13, textAlign: "left",
                    border: "none", cursor: "pointer",
                  }}
                >
                  <span style={{ color: "var(--text-3)", display: "inline-flex" }}>{it.icon}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.label}
                  </span>
                  {it.hint && <span className="kbd">{it.hint}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "8px 14px", borderTop: "1px solid var(--border)",
          fontSize: 11, color: "var(--text-3)", background: "var(--bg-sub)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="kbd">↵</span> open
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="kbd">↑</span><span className="kbd">↓</span> navigate
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="kbd">ESC</span> close
          </span>
          <div style={{ flex: 1 }} />
          <span className="mono">MTAC · v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
