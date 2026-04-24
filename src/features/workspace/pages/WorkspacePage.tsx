import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { listProjectsApi, type ProjectListItem } from "@/api/project";
import { getWorkspaceActivityApi, type ActivityItem } from "@/api/workspace";
import { Avatar } from "@/components/shared/Avatar";
import { I } from "@/icons";
import { Btn } from "@/components/shared/Btn";
import { Input } from "@/components/shared/Input";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectTable } from "../components/ProjectTable";
import { CreateProjectModal } from "../components/CreateProjectModal";

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

function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0)
    return <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>No activity yet.</div>;
  return (
    <div>
      {items.map((a) => (
        <div key={a._id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 28px", borderBottom: "1px solid var(--border)" }}>
          <Avatar user={{ name: a.actor_name || "?", hue: idToHue(a.actor_id) } as any} size={24} />
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 500 }}>{a.actor_name?.split(" ")[0] ?? "Someone"}</span>{" "}
            <span style={{ color: "var(--text-3)" }}>{a.verb}</span>{" "}
            <span className="mono" style={{ color: "var(--accent)" }}>{a.target}</span>
            {a.to && <> <span style={{ color: "var(--text-3)" }}>→</span> <span>{a.to}</span></>}
          </div>
          <span className="mono" style={{ color: "var(--text-4)", fontSize: 11, flexShrink: 0 }}>{timeSince(a.created_at)}</span>
        </div>
      ))}
    </div>
  );
}

type View = "grid" | "list";
type Tab  = "projects" | "activity";

const TABS: { k: Tab; label: string }[] = [
  { k: "projects", label: "Projects" },
  { k: "activity", label: "Activity" },
];

export default function WorkspacePage() {
  const navigate  = useNavigate();
  const { slug }  = useParams<{ slug: string }>();
  const workspace = useWorkspaceStore((s) => s.workspace);

  const [tab, setTab]       = useState<Tab>("projects");
  const [view, setView]     = useState<View>("grid");
  const [query, setQuery]   = useState("");
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", workspace?._id],
    queryFn: () => listProjectsApi(workspace!._id),
    enabled: !!workspace,
  });

  const { data: activityItems = [], isLoading: activityLoading } = useQuery({
    queryKey: ["ws-activity", workspace?._id],
    queryFn: () => getWorkspaceActivityApi(workspace!._id, 50),
    enabled: !!workspace && tab === "activity",
    staleTime: 30_000,
  });

  const projects = data?.data ?? [];
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleTabClick(t: Tab) {
    setTab(t);
  }

  function handleProjectClick(p: ProjectListItem) {
    navigate(`/w/${slug}/p/${p._id}`);
  }

  return (
    <div>
      {/* ── Sticky header ── */}
      <div style={{
        padding: "20px 28px 0",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0,
        background: "var(--bg)", zIndex: 5,
      }}>
        {/* Breadcrumb */}
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, fontSize: 11 }}>
          WORKSPACE / <span style={{ color: "var(--text-2)" }}>{workspace?.name ?? slug}</span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}>
            {I.layers({ size: 22 })}
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>
            {workspace?.name ?? "Workspace"}
          </h1>
          <div style={{ flex: 1 }} />
          <Btn
            variant="primary"
            size="sm"
            icon={I.plus({ size: 13, stroke: 2 })}
            onClick={() => setCreating(true)}
          >
            New project
          </Btn>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => handleTabClick(t.k)}
              style={{
                padding: "8px 14px", fontSize: 12.5, fontWeight: 500,
                color: tab === t.k ? "var(--text)" : "var(--text-3)",
                borderBottom: tab === t.k ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, background: "none", cursor: "pointer",
                transition: "color 0.08s",
              }}
            >
              {t.label}
              {t.k === "projects" && (
                <span className="mono" style={{ color: "var(--text-4)", marginLeft: 6 }}>
                  {projects.length || ""}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px" }}>
        <div style={{ width: 260 }}>
          <Input
            icon={I.search({ size: 13 })}
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
          />
        </div>
        <Btn variant="ghost" size="sm" icon={I.filter({ size: 13 })} onClick={() => toast.info("Filter coming soon.")}>Filter</Btn>
        <div style={{ flex: 1 }} />
        {/* Grid / List toggle */}
        <div style={{
          display: "flex",
          background: "var(--bg-sub)", border: "1px solid var(--border)",
          borderRadius: 5, padding: 2,
        }}>
          {([["grid", I.layers], ["list", I.list]] as const).map(([k, icon]) => (
            <button
              key={k}
              onClick={() => setView(k as View)}
              style={{
                width: 26, height: 22, borderRadius: 3,
                background: view === k ? "var(--bg-2)" : "transparent",
                color: view === k ? "var(--text)" : "var(--text-3)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: view === k ? "var(--shadow-sm)" : "none",
                border: "none", cursor: "pointer",
              }}
            >
              {icon({ size: 13 })}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {tab === "activity" && (
        <div style={{ padding: "0 0 28px" }}>
          {activityLoading ? (
            <div style={{ padding: "40px 28px", color: "var(--text-3)", fontSize: 13 }}>Loading…</div>
          ) : (
            <ActivityList items={activityItems} />
          )}
        </div>
      )}

      <div style={{ padding: "0 28px 28px", display: tab === "projects" ? undefined : "none" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 130, borderRadius: 8, background: "var(--bg-sub)", border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: "48px 24px", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: 8,
            color: "var(--text-3)", fontSize: 13,
          }}>
            {query ? `No projects match "${query}"` : "No projects yet — create your first one."}
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {filtered.map((p, idx) => (
              <ProjectCard key={p._id} project={p} idx={idx} onClick={() => handleProjectClick(p)} />
            ))}
          </div>
        ) : (
          <ProjectTable projects={filtered} onProject={handleProjectClick} />
        )}
      </div>

      <CreateProjectModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => toast.success("Project created.")}
      />
    </div>
  );
}
