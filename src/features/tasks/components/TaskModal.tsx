import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { updateTaskApi, createTaskApi } from "@/api/task";
import { listProjectsApi } from "@/api/project";
import { getCommentsApi, addCommentApi } from "@/api/comment";
import type { Task, TaskStatus, TaskPriority } from "@/types/domain";
import { Modal } from "@/components/shared/Modal";
import { Popover, MenuItem } from "@/components/shared/Popover";
import { Avatar } from "@/components/shared/Avatar";
import { Btn } from "@/components/shared/Btn";
import { Tag } from "@/components/shared/Tag";
import { StatusDot, PriorityBars, I } from "@/icons";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo:        "Todo",
  in_progress: "In Progress",
  done:        "Done",
};

const PRIORITIES: TaskPriority[] = ["urgent", "high", "med", "low", "none"];

function timeSince(iso: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

// ─── Shared sidebar components ────────────────────────────────────────────────

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6, fontSize: 10.5, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

function SidebarBtn({ children, onClick, icon, ref: _ref }: {
  children: React.ReactNode; onClick?: () => void;
  icon?: React.ReactNode; ref?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12.5, cursor: "pointer", textAlign: "left" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {icon}
      <span style={{ flex: 1 }}>{children}</span>
      {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
    </button>
  );
}

// ─── New Task Form ────────────────────────────────────────────────────────────

function NewTaskForm({ onClose }: { onClose: () => void }) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const queryClient = useQueryClient();

  const [title, setTitle]         = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus]       = useState<TaskStatus>("todo");
  const [loading, setLoading]     = useState(false);

  const { data } = useQuery({
    queryKey: ["projects", workspace?._id],
    queryFn: () => listProjectsApi(workspace!._id),
    enabled: !!workspace,
  });
  const projects = data?.data ?? [];

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspace || !projectId || !title.trim()) return;
    setLoading(true);
    try {
      await createTaskApi(workspace._id, projectId, { title: title.trim() });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, projectId] });
      toast.success("Task created.");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message ?? err?.response?.data?.message ?? "Failed to create task.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 500 }}>New task</div>
      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea autoFocus placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required
          style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, fontWeight: 500, background: "var(--bg-sub)", color: "var(--text)", resize: "none", outline: "none", fontFamily: "inherit", minHeight: 42 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <SidebarLabel>Project</SidebarLabel>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required
              style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 5, background: "var(--bg-2)", color: "var(--text)", fontSize: 12.5, cursor: "pointer" }}>
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <SidebarLabel>Status</SidebarLabel>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}
              style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 5, background: "var(--bg-2)", color: "var(--text)", fontSize: 12.5, cursor: "pointer" }}>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size="sm" type="submit" disabled={loading || !title.trim() || !projectId}>
            {loading ? "Creating…" : "Create task"}
          </Btn>
        </div>
      </form>
    </div>
  );
}

// ─── Task Detail ─────────────────────────────────────────────────────────────

function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const user        = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [local, setLocal]           = useState<Task>(task);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const didMount = useRef(false);

  useEffect(() => { setLocal(task); didMount.current = false; }, [task._id]);

  const statusRef = useRef<HTMLButtonElement>(null);
  const prioRef   = useRef<HTMLButtonElement>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [prioOpen, setPrioOpen]     = useState(false);

  // Fetch real comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["comments", task._id],
    queryFn: () => getCommentsApi(workspace!._id, task.project_id, task._id),
    enabled: !!workspace && !!task._id,
  });

  // Auto-save title/description
  const saveText = useCallback(async (patch: { title?: string; description?: string }) => {
    if (!workspace) return;
    try {
      await updateTaskApi(workspace._id, task.project_id, task._id, patch);
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, task.project_id] });
    } catch { toast.error("Failed to save changes."); }
  }, [workspace, task._id, task.project_id, queryClient]);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const t = setTimeout(() => saveText({ title: local.title }), 800);
    return () => clearTimeout(t);
  }, [local.title]);

  useEffect(() => {
    if (!didMount.current) return;
    const t = setTimeout(() => saveText({ description: local.description }), 800);
    return () => clearTimeout(t);
  }, [local.description]);

  // Status change — immediate
  async function handleStatusChange(s: TaskStatus) {
    setLocal((p) => ({ ...p, status: s })); setStatusOpen(false);
    if (!workspace) return;
    try {
      await updateTaskApi(workspace._id, task.project_id, task._id, { status: s });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, task.project_id] });
    } catch {
      toast.error("Failed to update status.");
      setLocal((p) => ({ ...p, status: task.status }));
    }
  }

  // Priority change — immediate
  async function handlePriorityChange(p: TaskPriority) {
    setLocal((prev) => ({ ...prev, priority: p })); setPrioOpen(false);
    if (!workspace) return;
    try {
      await updateTaskApi(workspace._id, task.project_id, task._id, { priority: p });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, task.project_id] });
    } catch { toast.error("Failed to update priority."); }
  }

  // Post comment
  async function handleComment() {
    if (!newComment.trim() || !workspace) return;
    setPostingComment(true);
    try {
      await addCommentApi(workspace._id, task.project_id, task._id, newComment.trim());
      setNewComment("");
      refetchComments();
    } catch { toast.error("Failed to post comment."); }
    finally { setPostingComment(false); }
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5 }}>{local.key}</span>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" icon={I.copy({ size: 13 })} onClick={() => { navigator.clipboard.writeText(task._id); toast.success("Task ID copied."); }} />
        <Btn variant="ghost" size="sm" icon={I.link({ size: 13 })} onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied."); }} />
        <Btn variant="ghost" size="sm" icon={I.more({ size: 14 })} />
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
        <Btn variant="ghost" size="sm" icon={I.x({ size: 13 })} onClick={onClose} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", minHeight: 400 }}>
        {/* Main panel */}
        <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
          <textarea value={local.title} onChange={(e) => setLocal((p) => ({ ...p, title: e.target.value }))}
            style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: "var(--text)", fontSize: 20, fontWeight: 500, letterSpacing: -0.02, lineHeight: 1.25, fontFamily: "inherit", padding: 0, minHeight: 30 }} />
          <textarea value={local.description ?? ""} onChange={(e) => setLocal((p) => ({ ...p, description: e.target.value }))}
            placeholder="Add a description…"
            style={{ width: "100%", marginTop: 8, border: "none", outline: "none", resize: "vertical", background: "transparent", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "inherit", minHeight: 80, padding: 0 }} />

          {/* Activity / Comments */}
          <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>
              Activity · {comments.length}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
              {comments.map((c) => (
                <div key={c._id} style={{ display: "flex", gap: 10 }}>
                  <Avatar user={{ _id: c.author_id._id, name: c.author_id.name, email: c.author_id.email, hue: c.author_id.hue ?? idToHue(c.author_id._id) }} size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.author_id.name}</span>
                      <span className="mono" style={{ color: "var(--text-4)" }}>{timeSince(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-2)", marginTop: 2 }}>{c.body}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div style={{ color: "var(--text-3)", fontSize: 12.5, fontStyle: "italic" }}>No comments yet.</div>
              )}
            </div>

            {/* New comment */}
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar user={user} size={24} />
              <div style={{ flex: 1, padding: 10, background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 6 }}>
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment…"
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleComment(); } }}
                  style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: "var(--text)", fontSize: 13, lineHeight: 1.5, fontFamily: "inherit", minHeight: 44 }} />
                <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
                  <div style={{ flex: 1 }} />
                  <span className="mono" style={{ color: "var(--text-4)", marginRight: 8, fontSize: 10.5 }}>⌘ + ENTER</span>
                  <Btn variant="primary" size="sm" disabled={!newComment.trim() || postingComment} onClick={handleComment}>
                    {postingComment ? "Posting…" : "Comment"}
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, background: "var(--bg-sub)" }}>
          {/* Status */}
          <div>
            <SidebarLabel>Status</SidebarLabel>
            <button ref={statusRef} onClick={() => setStatusOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12.5, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <StatusDot status={local.status} size={12} />
              <span style={{ flex: 1 }}>{STATUS_LABELS[local.status]}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={statusRef} open={statusOpen} onClose={() => setStatusOpen(false)}>
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                <MenuItem key={s} icon={<StatusDot status={s} size={11} />} selected={s === local.status} onClick={() => handleStatusChange(s)}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Assignee */}
          <div>
            <SidebarLabel>Assignee</SidebarLabel>
            <button
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12.5, cursor: "pointer" }}
              onClick={() => toast.info("Assignee picker coming soon.", { description: "Needs workspace members endpoint." })}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <Avatar user={local.assigned_to} size={18} />
              <span style={{ flex: 1 }}>{local.assigned_to?.name ?? "Unassigned"}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
          </div>

          {/* Priority */}
          <div>
            <SidebarLabel>Priority</SidebarLabel>
            <button ref={prioRef} onClick={() => setPrioOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12.5, cursor: "pointer", textTransform: "capitalize" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <PriorityBars level={local.priority} />
              <span style={{ flex: 1, textTransform: "capitalize" }}>{local.priority}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={prioRef} open={prioOpen} onClose={() => setPrioOpen(false)}>
              {PRIORITIES.map((p) => (
                <MenuItem key={p} icon={<PriorityBars level={p} />} selected={p === local.priority} onClick={() => handlePriorityChange(p)}>
                  <span style={{ textTransform: "capitalize" }}>{p}</span>
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Due date */}
          <div>
            <SidebarLabel>Due</SidebarLabel>
            <div style={{ position: "relative" }}>
              <button
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12.5, color: local.due ? "var(--text)" : "var(--text-3)", cursor: "pointer" }}
                onClick={() => toast.info("Due date picker coming soon.", { description: "Task model has due field — UI date picker needed." })}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                {I.calendar({ size: 13 })}
                <span>{local.due ?? "No date"}</span>
              </button>
            </div>
          </div>

          {/* Labels */}
          <div>
            <SidebarLabel>Labels</SidebarLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {local.labels.map((l) => <Tag key={l}>{l}</Tag>)}
              <button
                onClick={() => toast.info("Labels editor coming soon.")}
                style={{ padding: "0 6px", height: 18, fontSize: 11, color: "var(--text-3)", border: "1px dashed var(--border-strong)", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 3, background: "transparent", cursor: "pointer" }}>
                {I.plus({ size: 10, stroke: 2 })} Add
              </button>
            </div>
          </div>

          {/* Meta footer */}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: 10.5, lineHeight: 1.9 }}>
              <div>CREATED · {timeSince(task.created_at)}</div>
              <div>UPDATED · {timeSince(task.updated_at)}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ID · {task._id}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function TaskModal() {
  const { task, open, closeTask } = useTaskModalStore();
  return (
    <Modal open={open} onClose={closeTask} width={task ? 780 : 480}>
      {task
        ? <TaskDetail task={task} onClose={closeTask} />
        : <NewTaskForm onClose={closeTask} />
      }
    </Modal>
  );
}
