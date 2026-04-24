import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { listProjectsApi, type ProjectListItem } from "@/api/project";
import { I } from "@/icons";
import { Btn } from "@/components/shared/Btn";
import { Input } from "@/components/shared/Input";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectTable } from "../components/ProjectTable";
import { CreateProjectModal } from "../components/CreateProjectModal";

type View = "grid" | "list";
type Tab  = "projects" | "members" | "activity" | "settings";

const TABS: { k: Tab; label: string }[] = [
  { k: "projects",  label: "Projects"  },
  { k: "members",   label: "Members"   },
  { k: "activity",  label: "Activity"  },
  { k: "settings",  label: "Settings"  },
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

  const projects = data?.data ?? [];
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleTabClick(t: Tab) {
    if (t === "members")  { navigate(`/w/${slug}/members`);  return; }
    if (t === "settings") { navigate(`/w/${slug}/settings`); return; }
    if (t === "activity") {
      // TODO backend: add GET /workspace/:id/activity endpoint for activity feed
      toast.info("Activity feed coming soon.", { description: "Check back after the backend endpoint is ready." });
      return;
    }
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
            variant="secondary"
            size="sm"
            icon={I.settings({ size: 13 })}
            onClick={() => navigate(`/w/${slug}/settings`)}
          >
            Settings
          </Btn>
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
          />
        </div>
        <Btn variant="ghost" size="sm" icon={I.filter({ size: 13 })}>Filter</Btn>
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
      <div style={{ padding: "0 28px 28px" }}>
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
