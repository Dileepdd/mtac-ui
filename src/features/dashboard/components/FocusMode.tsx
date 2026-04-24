import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { getMyTasksApi } from "@/api/workspace";
import type { Task, TaskPriority, TaskStatus } from "@/types/domain";
import { I } from "@/icons";
import { StatusDot, PriorityBars } from "@/icons";

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

function mapTask(t: any): Task {
  return {
    _id:          String(t._id),
    key:          t.key ?? "—",
    title:        t.title,
    status:       t.status as TaskStatus,
    priority:     (t.priority ?? "med") as TaskPriority,
    assigned_to:  t.assigned_to ? {
      _id: String(t.assigned_to._id), name: t.assigned_to.name,
      email: "", hue: idToHue(String(t.assigned_to._id)),
    } : undefined,
    project_id:   String(t.project_id),
    workspace_id: String(t.workspace_id),
    labels:       t.labels ?? [],
    due:          t.due ? new Date(t.due).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
    created_at:   t.created_at,
    updated_at:   t.updated_at,
  };
}

interface FocusModeProps {
  userName: string;
  onOpenTask: (task: Task) => void;
}

export function FocusMode({ onOpenTask }: FocusModeProps) {
  const workspace = useWorkspaceStore((s) => s.workspace);

  const { data: raw, isLoading } = useQuery({
    queryKey: ["my-tasks", workspace?._id],
    queryFn: () => getMyTasksApi(workspace!._id, "todo,in_progress"),
    enabled: !!workspace,
    staleTime: 30_000,
  });

  const all    = (raw ?? []).map(mapTask);
  const inProg = all.filter((t) => t.status === "in_progress");
  const next   = all.filter((t) => t.status === "todo");

  if (isLoading) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 28px" }}>
        <div style={{ color: "var(--text-3)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 28px" }}>
      <div className="mono" style={{ color: "var(--text-3)", marginBottom: 6 }}>FOCUS MODE</div>
      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.025, margin: "0 0 6px" }}>
        You have {inProg.length + next.length} things to do today.
      </h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 40px", fontSize: 14 }}>
        Everything else is filtered out. Press <span className="kbd">⌘K</span> to jump, or <span className="kbd">C</span> to add.
      </p>

      {/* In Progress — pinned */}
      {inProg[0] && (
        <div style={{ padding: 20, border: "1px solid var(--accent)", borderRadius: "var(--radius-lg)", background: "var(--accent-wash)", marginBottom: 28 }}>
          <div className="mono" style={{ color: "var(--accent)", marginBottom: 8 }}>NOW · IN PROGRESS</div>
          <button onClick={() => onOpenTask(inProg[0])} style={{ textAlign: "left", width: "100%", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{inProg[0].title}</div>
            <div className="mono" style={{ color: "var(--text-3)" }}>{inProg[0].key} · due {inProg[0].due ?? "—"}</div>
          </button>
        </div>
      )}

      <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>Up next · {next.length}</div>
      <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
        {next.map((t, i) => (
          <button
            key={t._id}
            onClick={() => onOpenTask(t)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "0 16px", height: 44, borderTop: i ? "1px solid var(--border)" : "none", textAlign: "left", background: "transparent" }}
          >
            <PriorityBars level={t.priority} />
            <StatusDot status={t.status} size={14} />
            <span style={{ flex: 1, fontSize: 13.5 }}>{t.title}</span>
            <span className="mono" style={{ color: "var(--text-3)" }}>{t.due ?? "—"}</span>
          </button>
        ))}
        {next.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Inbox zero. Well done.</div>
        )}
      </div>

      {/* AI digest stub */}
      <div style={{ marginTop: 40, padding: 16, border: "1px dashed var(--border)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 12, color: "var(--text-3)", fontSize: 12.5 }}>
        {I.sparkle({ size: 14, style: { color: "var(--accent)" } })}
        <span>AI digest coming soon — project health summary will appear here.</span>
      </div>
    </div>
  );
}
