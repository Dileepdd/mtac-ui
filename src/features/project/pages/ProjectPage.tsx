import { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { listTasksApi, createTaskApi, updateTaskApi, type BackendTask } from "@/api/task";
import { getProjectApi, updateProjectApi } from "@/api/project";
import type { Task, TaskStatus } from "@/types/domain";
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

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

type View    = "board" | "list";
type Variant = "v1" | "v2";

export default function ProjectPage() {
  const navigate    = useNavigate();
  const { slug, key: projectId } = useParams<{ slug: string; key: string }>();
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const openTask    = useTaskModalStore((s) => s.openTask);
  const queryClient = useQueryClient();

  const [view, setView]       = useState<View>("board");
  const [variant, setVariant] = useState<Variant>("v1");
  const [query, setQuery]     = useState("");

  // Rename state
  const [renaming, setRenaming]     = useState(false);
  const [renameVal, setRenameVal]   = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const { data: projectData, refetch: refetchProject } = useQuery({
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
  const createdAt    = projectData?.created_at ?? "";
  const createdBy    = projectData?.created_by;
  const creatorName  = typeof createdBy === "object" && createdBy !== null
    ? createdBy.name
    : null;

  const [localTasks, setLocalTasks] = useState<Task[] | null>(null);
  const tasks: Task[] = localTasks ?? (taskData?.data ?? []).map(mapTask);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  // ── Rename handlers ──────────────────────────────────────────────────────

  function startRename() {
    setRenameVal(projectName);
    setRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 0);
  }

  function cancelRename() {
    setRenaming(false);
    setRenameVal("");
  }

  async function saveRename() {
    const name = renameVal.trim();
    if (!name || !workspace || !projectId) { cancelRename(); return; }
    if (name === projectName) { cancelRename(); return; }
    setRenameSaving(true);
    try {
      await updateProjectApi(workspace._id, projectId, { name });
      queryClient.invalidateQueries({ queryKey: ["project", workspace._id, projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", workspace._id] });
      refetchProject();
      toast.success("Project renamed.");
      setRenaming(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to rename project.");
    } finally {
      setRenameSaving(false);
    }
  }

  // ── Drag-drop ────────────────────────────────────────────────────────────

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

  // ── Inline task creation ──────────────────────────────────────────────────

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
      const created = await createTaskApi(workspace._id, projectId, { title, status });
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

        {/* Breadcrumb */}
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <button onClick={() => navigate(`/w/${slug}/projects`)} style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
            PROJECTS
          </button>
          {I.chevRight({ size: 10, stroke: 2 })}
          <span style={{ color: "var(--text-2)" }}>{projectKey}</span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <ProjectGlyph project={{ name: projectName, color: projectColor }} size={24} />

          {renaming ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <input
                ref={renameInputRef}
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") cancelRename();
                }}
                style={{
                  fontSize: 20, fontWeight: 500, letterSpacing: -0.02,
                  border: "1px solid var(--accent)", borderRadius: 5,
                  padding: "2px 8px", background: "var(--bg-sub)",
                  color: "var(--text)", outline: "none", fontFamily: "inherit",
                  minWidth: 200,
                }}
              />
              <Btn variant="primary" size="sm" onClick={saveRename} disabled={renameSaving}>
                {renameSaving ? "Saving…" : "Save"}
              </Btn>
              <Btn variant="ghost" size="sm" onClick={cancelRename}>Cancel</Btn>
            </div>
          ) : (
            <h1
              title="Click to rename"
              onClick={startRename}
              style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            >
              {projectName}
            </h1>
          )}

          {!renaming && <span className="mono" style={{ color: "var(--text-3)" }}>{projectKey}</span>}
          <div style={{ flex: 1 }} />

          {!renaming && (
            <>
              <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
                {([["board", I.board, "Board"], ["list", I.list, "List"]] as const).map(([k, icon, label]) => (
                  <button key={k} onClick={() => setView(k as View)} style={{ padding: "0 10px", height: 22, borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 5, background: view === k ? "var(--bg-2)" : "transparent", color: view === k ? "var(--text)" : "var(--text-3)", fontSize: 11.5, fontWeight: 500, boxShadow: view === k ? "var(--shadow-sm)" : "none", border: "none", cursor: "pointer" }}>
                    {icon({ size: 13 })} {label}
                  </button>
                ))}
              </div>
              <Btn variant="primary" size="sm" icon={I.plus({ size: 13, stroke: 2 })} kbd="C" onClick={() => openTask(null, projectId)}>
                New task
              </Btn>
            </>
          )}
        </div>

        {/* Project metadata */}
        {(creatorName || createdAt) && (
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)", marginBottom: 10, display: "flex", gap: 12 }}>
            {creatorName && <span>Created by {creatorName}</span>}
            {createdAt && <span>{formatDate(createdAt)}</span>}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 240 }}>
          <Input 
            icon={I.search({ size: 13 })} 
            placeholder="Search tasks…" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            rightEl={
              query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                  title="Clear"
                >
                  {I.x({ size: 14 })}
                </button>
              )
            }
          />
        </div>
        <Btn variant="ghost" size="sm" icon={I.filter({ size: 13 })} onClick={() => toast.info("Filters coming soon.")}>Filter</Btn>
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
        <Btn variant="ghost" size="sm" icon={I.more({ size: 14 })} onClick={() => toast.info("More options coming soon.")} />
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
