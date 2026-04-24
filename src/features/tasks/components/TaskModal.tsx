import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { updateTaskApi, createTaskApi } from "@/api/task";
import { listProjectsApi } from "@/api/project";
import { listMembersApi } from "@/api/member";
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
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24)    return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

// ─── Shared layout pieces ─────────────────────────────────────────────────────

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6, fontSize: 10.5, letterSpacing: 0.3 }}>
      {children}
    </div>
  );
}

const sidebarBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, width: "100%",
  padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
  borderRadius: 5, fontSize: 12.5, cursor: "pointer",
};

// ─── New Task Form ────────────────────────────────────────────────────────────

function NewTaskForm({ onClose, defaultProjectId }: { onClose: () => void; defaultProjectId: string | null }) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const queryClient = useQueryClient();

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId]   = useState(defaultProjectId ?? "");
  const [status, setStatus]         = useState<TaskStatus>("todo");
  const [priority, setPriority]     = useState<TaskPriority>("med");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading]       = useState(false);

  const projectRef  = useRef<HTMLButtonElement>(null);
  const statusRef   = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const [projectOpen, setProjectOpen]   = useState(false);
  const [statusOpen, setStatusOpen]     = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ["projects", workspace?._id],
    queryFn: () => listProjectsApi(workspace!._id),
    enabled: !!workspace,
  });
  const projects = projectsData?.data ?? [];

  const { data: membersData } = useQuery({
    queryKey: ["members", workspace?._id],
    queryFn: () => listMembersApi(workspace!._id),
    enabled: !!workspace,
  });
  const members = membersData?.data?.members ?? [];

  const assigneeName = members.find((m) => m.user_id._id === assigneeId)?.user_id.name;
  const assigneeUser = members.find((m) => m.user_id._id === assigneeId)?.user_id;

  async function handleCreate() {
    if (!workspace || !projectId || !title.trim()) return;
    setLoading(true);
    try {
      await createTaskApi(workspace._id, projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigned_to: assigneeId || undefined,
      });
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

  const canCreate = !!title.trim() && !!projectId;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5 }}>New task</span>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" icon={I.x({ size: 13 })} onClick={onClose} />
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", minHeight: 400 }}>
        {/* Left: title + description */}
        <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
          <textarea
            autoFocus
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              background: "transparent", color: "var(--text)", fontSize: 20,
              fontWeight: 500, letterSpacing: -0.02, lineHeight: 1.25,
              fontFamily: "inherit", padding: 0, minHeight: 30,
            }}
          />
          <textarea
            placeholder="Add a description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%", marginTop: 8, border: "none", outline: "none",
              resize: "vertical", background: "transparent", color: "var(--text-2)",
              fontSize: 13.5, lineHeight: 1.6, fontFamily: "inherit", minHeight: 80, padding: 0,
            }}
          />
        </div>

        {/* Right: sidebar */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, background: "var(--bg-sub)" }}>
          {/* Project — only when not inside a project already */}
          {!defaultProjectId && (
            <div>
              <SidebarLabel>Project</SidebarLabel>
              <button
                ref={projectRef}
                onClick={() => setProjectOpen((p) => !p)}
                style={{ ...sidebarBtnStyle, color: projectId ? "var(--text)" : "var(--text-3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                {I.folder({ size: 13 })}
                <span style={{ flex: 1 }}>{projects.find((p) => p._id === projectId)?.name ?? "Select project…"}</span>
                {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
              </button>
              <Popover anchor={projectRef} open={projectOpen} onClose={() => setProjectOpen(false)}>
                {projects.map((p) => (
                  <MenuItem
                    key={p._id}
                    icon={I.folder({ size: 13 })}
                    selected={p._id === projectId}
                    onClick={() => { setProjectId(p._id); setProjectOpen(false); }}
                  >
                    {p.name}
                  </MenuItem>
                ))}
              </Popover>
            </div>
          )}

          {/* Status */}
          <div>
            <SidebarLabel>Status</SidebarLabel>
            <button
              ref={statusRef}
              onClick={() => setStatusOpen((p) => !p)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <StatusDot status={status} size={12} />
              <span style={{ flex: 1 }}>{STATUS_LABELS[status]}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={statusRef} open={statusOpen} onClose={() => setStatusOpen(false)}>
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                <MenuItem key={s} icon={<StatusDot status={s} size={11} />} selected={s === status} onClick={() => { setStatus(s); setStatusOpen(false); }}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Assignee */}
          <div>
            <SidebarLabel>Assignee</SidebarLabel>
            <button
              ref={assigneeRef}
              onClick={() => setAssigneeOpen((p) => !p)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <Avatar user={assigneeUser ?? null} size={18} />
              <span style={{ flex: 1 }}>{assigneeName ?? "Unassigned"}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={assigneeRef} open={assigneeOpen} onClose={() => setAssigneeOpen(false)}>
              <MenuItem icon={<Avatar user={null} size={16} />} selected={!assigneeId} onClick={() => { setAssigneeId(""); setAssigneeOpen(false); }}>
                Unassigned
              </MenuItem>
              {members.map((m) => (
                <MenuItem
                  key={m.user_id._id}
                  icon={<Avatar user={m.user_id} size={16} />}
                  selected={m.user_id._id === assigneeId}
                  onClick={() => { setAssigneeId(m.user_id._id); setAssigneeOpen(false); }}
                >
                  {m.user_id.name}
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Priority */}
          <div>
            <SidebarLabel>Priority</SidebarLabel>
            <button
              ref={priorityRef}
              onClick={() => setPriorityOpen((p) => !p)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <PriorityBars level={priority} />
              <span style={{ flex: 1, textTransform: "capitalize" }}>{priority}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={priorityRef} open={priorityOpen} onClose={() => setPriorityOpen(false)}>
              {PRIORITIES.map((p) => (
                <MenuItem key={p} icon={<PriorityBars level={p} />} selected={p === priority} onClick={() => { setPriority(p); setPriorityOpen(false); }}>
                  <span style={{ textTransform: "capitalize" }}>{p}</span>
                </MenuItem>
              ))}
            </Popover>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
        <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" size="sm" disabled={loading || !canCreate} onClick={handleCreate}>
          {loading ? "Creating…" : "Create task"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Task Detail ─────────────────────────────────────────────────────────────

function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const user        = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [local, setLocal]           = useState<Task>(task);
  const [dirty, setDirty]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => { setLocal(task); setDirty(false); }, [task._id]);

  const statusRef   = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const [statusOpen, setStatusOpen]     = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const { data: membersData } = useQuery({
    queryKey: ["members", workspace?._id],
    queryFn: () => listMembersApi(workspace!._id),
    enabled: !!workspace,
  });
  const members = membersData?.data?.members ?? [];

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["comments", task._id],
    queryFn: () => getCommentsApi(workspace!._id, task.project_id, task._id),
    enabled: !!workspace && !!task._id,
  });

  async function handleSave() {
    if (!workspace || !dirty) return;
    setSaving(true);
    try {
      await updateTaskApi(workspace._id, task.project_id, task._id, {
        title: local.title,
        description: local.description,
        status: local.status,
        priority: local.priority,
        assigned_to: (local.assigned_to as any)?._id ?? local.assigned_to ?? undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspace._id, task.project_id] });
      toast.success("Task updated.");
      onClose();
    } catch { toast.error("Failed to save changes."); }
    finally { setSaving(false); }
  }

  function handleStatusChange(s: TaskStatus) {
    setLocal((p) => ({ ...p, status: s }));
    setStatusOpen(false);
    setDirty(true);
  }

  function handlePriorityChange(p: TaskPriority) {
    setLocal((prev) => ({ ...prev, priority: p }));
    setPriorityOpen(false);
    setDirty(true);
  }

  function handleAssigneeChange(member: any | null) {
    setLocal((prev) => ({ ...prev, assigned_to: member }));
    setAssigneeOpen(false);
    setDirty(true);
  }

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
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5 }}>{local.key}</span>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" icon={I.copy({ size: 13 })} onClick={() => { navigator.clipboard.writeText(task._id); toast.success("Task ID copied."); }} />
        <Btn variant="ghost" size="sm" icon={I.link({ size: 13 })} onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied."); }} />
        <Btn variant="ghost" size="sm" icon={I.more({ size: 14 })} onClick={() => toast.info("Task actions coming soon.")} />
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
        <Btn variant="ghost" size="sm" icon={I.x({ size: 13 })} onClick={onClose} />
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", minHeight: 400 }}>
        {/* Main panel */}
        <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
          <textarea
            value={local.title}
            onChange={(e) => { setLocal((p) => ({ ...p, title: e.target.value })); setDirty(true); }}
            style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: "var(--text)", fontSize: 20, fontWeight: 500, letterSpacing: -0.02, lineHeight: 1.25, fontFamily: "inherit", padding: 0, minHeight: 30 }}
          />
          <textarea
            value={local.description ?? ""}
            onChange={(e) => { setLocal((p) => ({ ...p, description: e.target.value })); setDirty(true); }}
            placeholder="Add a description…"
            style={{ width: "100%", marginTop: 8, border: "none", outline: "none", resize: "vertical", background: "transparent", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "inherit", minHeight: 80, padding: 0 }}
          />

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
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment…"
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleComment(); } }}
                  style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: "var(--text)", fontSize: 13, lineHeight: 1.5, fontFamily: "inherit", minHeight: 44 }}
                />
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
            <button
              ref={statusRef}
              onClick={() => setStatusOpen(prev => !prev)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
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
              ref={assigneeRef}
              onClick={() => setAssigneeOpen((p) => !p)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <Avatar user={local.assigned_to} size={18} />
              <span style={{ flex: 1 }}>{local.assigned_to?.name ?? "Unassigned"}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={assigneeRef} open={assigneeOpen} onClose={() => setAssigneeOpen(false)}>
              <MenuItem icon={<Avatar user={null} size={16} />} selected={!local.assigned_to} onClick={() => handleAssigneeChange(null)}>
                Unassigned
              </MenuItem>
              {members.map((m) => (
                <MenuItem
                  key={m.user_id._id}
                  icon={<Avatar user={m.user_id} size={16} />}
                  selected={m.user_id._id === local.assigned_to?._id}
                  onClick={() => handleAssigneeChange(m.user_id)}
                >
                  {m.user_id.name}
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Priority */}
          <div>
            <SidebarLabel>Priority</SidebarLabel>
            <button
              ref={priorityRef}
              onClick={() => setPriorityOpen((p) => !p)}
              style={sidebarBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <PriorityBars level={local.priority} />
              <span style={{ flex: 1, textTransform: "capitalize" }}>{local.priority}</span>
              {I.chevDown({ size: 11, stroke: 2, style: { color: "var(--text-3)" } })}
            </button>
            <Popover anchor={priorityRef} open={priorityOpen} onClose={() => setPriorityOpen(false)}>
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
            <button
              style={{ ...sidebarBtnStyle, color: local.due ? "var(--text)" : "var(--text-3)" }}
              onClick={() => toast.info("Due date picker coming soon.", { description: "Task model has due field — UI date picker needed." })}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              {I.calendar({ size: 13 })}
              <span>{local.due ?? "No date"}</span>
            </button>
          </div>

          {/* Labels */}
          <div>
            <SidebarLabel>Labels</SidebarLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {local.labels.map((l) => <Tag key={l}>{l}</Tag>)}
              <button
                onClick={() => toast.info("Labels editor coming soon.")}
                style={{ padding: "0 6px", height: 18, fontSize: 11, color: "var(--text-3)", border: "1px dashed var(--border-strong)", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 3, background: "transparent", cursor: "pointer" }}
              >
                {I.plus({ size: 10, stroke: 2 })} Add
              </button>
            </div>
          </div>

          {/* Meta footer */}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: 10.5, lineHeight: 1.9 }}>
              <div>CREATED · {timeSince(task.created_at)}</div>
              <div>UPDATED · {timeSince(task.updated_at)}</div>
              {(task as any).created_by && (
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  BY · {(task as any).created_by?.name ?? (task as any).created_by}
                </div>
              )}
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ID · {task.key}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
        <Btn variant="ghost" size="sm" disabled={!dirty} onClick={() => { setLocal(task); setDirty(false); }}>Discard</Btn>
        <Btn variant="primary" size="sm" disabled={!dirty || saving || !local.title.trim()} onClick={handleSave}>
          {saving ? "Saving…" : "Update task"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function TaskModal() {
  const { task, open, closeTask, defaultProjectId } = useTaskModalStore();
  return (
    <Modal open={open} onClose={closeTask} width={780}>
      {task
        ? <TaskDetail task={task} onClose={closeTask} />
        : <NewTaskForm onClose={closeTask} defaultProjectId={defaultProjectId} />
      }
    </Modal>
  );
}
