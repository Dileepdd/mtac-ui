import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { listTasksApi, createTaskApi, updateTaskApi, type BackendTask } from "@/api/task";
import { getProjectApi } from "@/api/project";
import type { Task, TaskStatus, TaskPriority } from "@/types/domain";
import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import { Btn } from "@/components/shared/Btn";
import { Input } from "@/components/shared/Input";
import { I } from "@/icons";
import { KanbanBoard } from "../components/KanbanBoard";
import { ListView } from "../components/ListView";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

// Maps the backend task (now with real key, priority, labels, due) to frontend Task
function mapTask(t: BackendTask): Task {
  const assignedUser = t.assigned_to
    ? { _id: String(t.assigned_to._id), name: t.assigned_to.name, email: t.assigned_to.email ?? "", hue: idToHue(String(t.assigned_to._id)) }
    : undefined;

  return {
    _id:          String(t._id),
    key:          t.key,
    title:        t.title,
    description:  t.description,
    status:       t.status,
    priority:     t.priority,
    assigned_to:  assignedUser,
    project_id:   String(t.project_id),
    workspace_id: String(t.workspace_id),
    labels:       t.labels ?? [],
    due:          t.due ? new Date(t.due).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
    created_at:   t.created_at,
    updated_at:   t.updated_at,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

type View    = "board" | "list";
type Variant = "v1" | "v2";

export default function ProjectPage() {
  const navigate     = useNavigate();
  const { slug, key: projectId } = useParams<{ slug: string; key: string }>();
  const workspace    = useWorkspaceStore((s) => s.workspace);
  const openTask     = useTaskModalStore((s) => s.openTask);
  const queryClient  = useQueryClient();

  const [view, setView]       = useState<View>("board");
  const [variant, setVariant] = useState<Variant>("v1");
  const [query, setQuery]     = useState("");

  // Fetch real project details (key, color from backend)
  const { data: projectData } = useQuery({
    queryKey: ["project", workspace?._id, projectId],
    queryFn:  () => getProjectApi(workspace!._id, projectId!),
    enabled:  !!workspace && !!projectId,
  });

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["tasks", workspace?._id, projectId],
    queryFn:  () => listTasksApi(workspace!._id, projectId!),
    enabled:  !!workspace && !!projectId,
  });

  const projectName  = projectData?.name  ?? "Project";
  const projectKey   = projectData?.key   ?? "—";
  const projectColor = projectData?.color ?? "#4f46e5";

  const [localTasks, setLocalTasks] = useState<Task[] | null>(null);
  const tasks: Task[] = localTasks ?? (taskData?.data ?? []).map(mapTask);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  // Drag-drop: move task between columns (optimistic)
  const handleMove = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setLocalTasks((prev) => (prev ?? tasks).map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskApi(workspace!._id, projectId!, taskId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace?._id, projectId] });
    } catch {
      toast.error("Failed to update task status.");
      setLocalTasks(null);
    }
  }, [tasks, workspace, projectId, queryClient]);

  // Inline task creation (optimistic)
  const handleAdd = useCallback(async (status: TaskStatus, title: string) => {
    if (!workspace || !projectId) return;
    const tempId = "temp_" + Date.now();
    const tempTask: Task = {
      _id: tempId, key: "…", title, status, priority: "med",
      project_id: projectId, workspace_id: workspace._id,
      labels: [], created_at: "", updated_at: "",
    };
    setLocalTasks((prev) => [...(prev ?? tasks), tempTask]);
    try {
      const created = await createTaskApi(workspace._id, projectId, { title });
      setLocalTasks((prev) => (prev ?? []).map((t) => t._id === tempId ? mapTask(created) : t));
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, projectId] });
    } catch {
      toast.error("Failed to create task.");
      setLocalTasks((prev) => (prev ?? []).filter((t) => t._id !== tempId));
    }
  }, [tasks, workspace, projectId, queryClient]);

  return (
    <div>
      {/* ── Sticky header ── */}
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <button onClick={() => navigate(`/w/${slug}/projects`)} style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
            PROJECTS
          </button>
          {I.chevRight({ size: 10, stroke: 2 })}
          <span style={{ color: "var(--text-2)" }}>{projectKey}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <ProjectGlyph project={{ name: projectName, color: projectColor }} size={24} />
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>{projectName}</h1>
          <span className="mono" style={{ color: "var(--text-3)" }}>{projectKey}</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
            {([["board", I.board, "Board"], ["list", I.list, "List"]] as const).map(([k, icon, label]) => (
              <button key={k} onClick={() => setView(k as View)} style={{ padding: "0 10px", height: 22, borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 5, background: view === k ? "var(--bg-2)" : "transparent", color: view === k ? "var(--text)" : "var(--text-3)", fontSize: 11.5, fontWeight: 500, boxShadow: view === k ? "var(--shadow-sm)" : "none", border: "none", cursor: "pointer" }}>
                {icon({ size: 13 })} {label}
              </button>
            ))}
          </div>
          <Btn variant="primary" size="sm" icon={I.plus({ size: 13, stroke: 2 })} kbd="C" onClick={() => openTask(null)}>New task</Btn>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 240 }}>
          <Input icon={I.search({ size: 13 })} placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Btn variant="ghost" size="sm" icon={I.filter({ size: 13 })}>Filter</Btn>
        <div style={{ flex: 1 }} />
        {view === "board" && (
          <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
            {(["v1", "v2"] as Variant[]).map((v) => (
              <button key={v} onClick={() => setVariant(v)} style={{ padding: "0 10px", height: 22, borderRadius: 3, background: variant === v ? "var(--bg-2)" : "transparent", color: variant === v ? "var(--text)" : "var(--text-3)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, boxShadow: variant === v ? "var(--shadow-sm)" : "none", border: "none", cursor: "pointer" }}>
                {v === "v1" ? "CARDS" : "COMPACT"}
              </button>
            ))}
          </div>
        )}
        <Btn variant="ghost" size="sm" icon={I.more({ size: 14 })} />
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <div style={{ padding: 28, color: "var(--text-3)", fontSize: 13 }}>Loading tasks…</div>
      ) : view === "board" ? (
        <KanbanBoard tasks={filtered} variant={variant} onMove={handleMove} onAdd={handleAdd} onOpen={openTask} />
      ) : (
        <ListView tasks={filtered} onOpen={openTask} />
      )}
    </div>
  );
}
