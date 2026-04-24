import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import type { ProjectListItem } from "@/api/project";

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const COLS = "24px 1.8fr 0.6fr 1.2fr 0.6fr";

interface ProjectTableProps {
  projects: ProjectListItem[];
  onProject: (p: ProjectListItem) => void;
}

export function ProjectTable({ projects, onProject }: ProjectTableProps) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: COLS, gap: 12,
        padding: "8px 14px", borderBottom: "1px solid var(--border)",
        fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase",
      }}>
        <span /><span>Name</span><span>Key</span><span>Progress</span><span style={{ textAlign: "right" }}>Updated</span>
      </div>

      {projects.map((p) => {
        const pct = p.taskCount ? Math.round((p.done / p.taskCount) * 100) : 0;

        return (
          <button
            key={p._id}
            onClick={() => onProject(p)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            style={{
              display: "grid", gridTemplateColumns: COLS, gap: 12,
              alignItems: "center", width: "100%",
              padding: "0 14px", height: 40,
              borderTop: "1px solid var(--border)",
              textAlign: "left", background: "transparent",
              cursor: "pointer",
            }}
          >
            <ProjectGlyph project={{ name: p.name, color: p.color }} size={18} />
            <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </span>
            <span className="mono" style={{ color: "var(--text-3)" }}>{p.key}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden", maxWidth: 120 }}>
                <div style={{ height: "100%", width: pct + "%", background: "var(--accent)" }} />
              </div>
              <span className="mono" style={{ color: "var(--text-3)" }}>{p.done}/{p.taskCount}</span>
            </div>
            <span className="mono" style={{ color: "var(--text-4)", textAlign: "right" }}>
              {p.updated_at ? timeSince(p.updated_at) : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
