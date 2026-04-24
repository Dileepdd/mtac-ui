import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useTaskModalStore } from "@/stores/taskModalStore";
import { listProjectsApi } from "@/api/project";
import { getWorkspaceStatsApi, getWorkspaceActivityApi, getMyTasksApi } from "@/api/workspace";
import type { Task, TaskPriority, TaskStatus } from "@/types/domain";
import { Avatar } from "@/components/shared/Avatar";
import { StatCard } from "@/components/shared/StatCard";
import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import { StatusDot, PriorityBars } from "@/icons";
import { Tag } from "@/components/shared/Tag";

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

function mapMyTask(t: any): Task {
  return {
    _id:          String(t._id),
    key:          t.key ?? "—",
    title:        t.title,
    description:  t.description,
    status:       t.status as TaskStatus,
    priority:     (t.priority ?? "med") as TaskPriority,
    assigned_to:  t.assigned_to ? {
      _id:   String(t.assigned_to._id),
      name:  t.assigned_to.name,
      email: t.assigned_to.email ?? "",
      hue:   idToHue(String(t.assigned_to._id)),
    } : undefined,
    project_id:   String(t.project_id),
    workspace_id: String(t.workspace_id),
    labels:       t.labels ?? [],
    due:          t.due ? new Date(t.due).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
    created_at:   t.created_at,
    updated_at:   t.updated_at,
  };
}

// This week — still static (no calendar backend endpoint)
// TODO Phase 12+: replace with GET /workspace/:id/tasks?due_after=today&due_before=week_end
const MOCK_THIS_WEEK = [
  { day: "WED", date: "12", title: "Launch email sequence QA", time: "10:00" },
  { day: "THU", date: "13", title: "Press release review",     time: "14:30" },
  { day: "FRI", date: "14", title: "Q4 launch go/no-go",       time: "16:00" },
];

export function Overview() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const workspace = useWorkspaceStore((s) => s.workspace);
  const openTask  = useTaskModalStore((s) => s.openTask);

  const { data: projectData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", workspace?._id],
    queryFn: () => listProjectsApi(workspace!._id),
    enabled: !!workspace,
  });

  const { data: stats } = useQuery({
    queryKey: ["ws-stats", workspace?._id],
    queryFn: () => getWorkspaceStatsApi(workspace!._id),
    enabled: !!workspace,
    staleTime: 60_000,
  });

  const { data: activityRaw } = useQuery({
    queryKey: ["ws-activity", workspace?._id],
    queryFn: () => getWorkspaceActivityApi(workspace!._id, 10),
    enabled: !!workspace,
    staleTime: 30_000,
  });

  const { data: myTasksRaw } = useQuery({
    queryKey: ["my-tasks", workspace?._id],
    queryFn: () => getMyTasksApi(workspace!._id, "todo,in_progress"),
    enabled: !!workspace,
    staleTime: 30_000,
  });

  const projects  = projectData?.data ?? [];
  const activity  = activityRaw ?? [];
  const myTasks   = (myTasksRaw ?? []).map(mapMyTask).slice(0, 6);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        <StatCard label="Active projects"     value={stats?.projectCount      ?? "—"} delta={16} />
        <StatCard label="Open tasks"          value={stats?.openTaskCount     ?? "—"} delta={-4} />
        <StatCard label="Completed this week" value={stats?.completedThisWeek ?? "—"} delta={38} />
        <StatCard label="Team members"        value={stats?.memberCount       ?? "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        {/* Left column */}
        <div>
          {/* Projects grid */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3 }}>Projects</div>
            <div style={{ flex: 1 }} />
            <button onClick={() => navigate(`/w/${slug}/projects`)} style={{ fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", background: "none", border: "none", cursor: "pointer" }}>
              All projects →
            </button>
          </div>

          {projectsLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 90, borderRadius: 8, background: "var(--bg-sub)", border: "1px solid var(--border)" }} />)}
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--text-3)", fontSize: 13 }}>
              No projects yet. Create one from the Projects page.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {projects.map((p) => {
                const pct = p.taskCount ? Math.round((p.done / p.taskCount) * 100) : 0;
                return (
                  <button
                    key={p._id}
                    onClick={() => navigate(`/w/${slug}/p/${p._id}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                    style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textAlign: "left", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.1s", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProjectGlyph project={{ name: p.name, color: p.color }} size={22} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div className="mono" style={{ color: "var(--text-3)" }}>{p.key} · {timeSince(p.updated_at)}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                        <span>{p.done}/{p.taskCount} tasks</span><span>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: "var(--accent)" }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* My tasks */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3 }}>Assigned to me</div>
              <div style={{ flex: 1 }} />
              <span className="mono" style={{ color: "var(--text-4)" }}>{myTasks.length} open</span>
            </div>
            {myTasks.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--text-3)", fontSize: 12.5 }}>
                No open tasks assigned to you.
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--bg-2)" }}>
                {myTasks.map((t, i) => (
                  <button
                    key={t._id}
                    onClick={() => openTask(t)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0 14px", height: 36, borderTop: i ? "1px solid var(--border)" : "none", background: "transparent", textAlign: "left" }}
                  >
                    <PriorityBars level={t.priority} />
                    <StatusDot status={t.status} size={12} />
                    <span className="mono" style={{ color: "var(--text-3)", width: 58, flexShrink: 0 }}>{t.key}</span>
                    <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    {t.due && <span className="mono" style={{ color: "var(--text-3)" }}>{t.due}</span>}
                    <Avatar user={t.assigned_to} size={18} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Activity */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>Activity</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", padding: 6 }}>
              {activity.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>No activity yet.</div>
              ) : activity.map((a) => (
                <div key={a._id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", fontSize: 12.5, lineHeight: 1.4 }}>
                  <Avatar user={{ name: a.actor_name || "?", hue: idToHue(a.actor_id) } as any} size={18} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{a.actor_name?.split(" ")[0] ?? "Someone"}</span>{" "}
                    <span style={{ color: "var(--text-3)" }}>{a.verb}</span>{" "}
                    <span className="mono" style={{ color: "var(--accent)" }}>{a.target}</span>
                    {a.to && <> <span style={{ color: "var(--text-3)" }}>→</span> <span>{a.to}</span></>}
                  </div>
                  <span className="mono" style={{ color: "var(--text-4)", flexShrink: 0 }}>{timeSince(a.created_at)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* This week — static until calendar backend is added */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>This week</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", padding: 6 }}>
              {MOCK_THIS_WEEK.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
                  <div style={{ width: 36, textAlign: "center", padding: "4px 0", background: "var(--bg-sub)", borderRadius: 5, border: "1px solid var(--border)", flexShrink: 0 }}>
                    <div className="mono" style={{ color: "var(--text-3)", fontSize: 9.5 }}>{e.day}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1 }}>{e.date}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5 }}>{e.title}</div>
                    <div className="mono" style={{ color: "var(--text-3)" }}>{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
