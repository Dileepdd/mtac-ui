import { useState } from "react";
import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import type { ProjectListItem } from "@/api/project";

export const PROJECT_COLORS = [
  "#4f46e5", "#7c3aed", "#059669", "#b45309",
  "#be123c", "#0891b2", "#c2410c", "#15803d",
];

// Still exported so CreateProjectModal can use it for the color picker
export function deriveKey(name: string) {
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 4);
}

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface ProjectCardProps {
  project: ProjectListItem;
  idx:     number;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [hov, setHov] = useState(false);
  const pct     = project.taskCount ? Math.round((project.done / project.taskCount) * 100) : 0;
  const updated = project.updated_at ? timeSince(project.updated_at) : "—";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 14, background: "var(--bg-2)",
        border: `1px solid ${hov ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: "var(--radius)", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 14,
        transition: "border-color 0.1s", cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <ProjectGlyph project={{ name: project.name, color: project.color }} size={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.name}
          </div>
          <div className="mono" style={{ color: "var(--text-3)" }}>{project.key}</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
          <span>{project.done}/{project.taskCount} tasks</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: "var(--accent)" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ color: "var(--text-4)" }}>{updated}</span>
      </div>
    </button>
  );
}
