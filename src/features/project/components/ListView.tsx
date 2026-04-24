import type { Task, TaskStatus } from "@/types/domain";
import { Avatar } from "@/components/shared/Avatar";
import { Tag } from "@/components/shared/Tag";
import { StatusDot, PriorityBars, I } from "@/icons";

const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "todo",        label: "Todo"        },
  { key: "in_progress", label: "In Progress" },
  { key: "done",        label: "Done"        },
];

interface ListViewProps {
  tasks: Task[];
  onOpen: (t: Task) => void;
}

export function ListView({ tasks, onOpen }: ListViewProps) {
  const grouped = STATUSES.map((s) => ({
    ...s,
    tasks: tasks.filter((t) => t.status === s.key),
  }));

  return (
    <div style={{ padding: "12px 28px 28px" }}>
      {grouped.map((g) => (
        <div key={g.key} style={{ marginBottom: 18 }}>
          {/* Group header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "4px 0 8px",
            borderBottom: "1px solid var(--border)",
          }}>
            <StatusDot status={g.key} size={12} />
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{g.label}</span>
            <span className="mono" style={{ color: "var(--text-4)" }}>{g.tasks.length}</span>
          </div>

          {g.tasks.length === 0 && (
            <div style={{ padding: "10px 8px", fontSize: 12, color: "var(--text-3)" }}>No tasks</div>
          )}

          {g.tasks.map((t) => (
            <div
              key={t._id}
              onClick={() => onOpen(t)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 14px 60px 1fr auto auto auto auto",
                gap: 10, alignItems: "center",
                padding: "0 8px", height: 34,
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <PriorityBars level={t.priority} />
              <StatusDot status={t.status} size={12} />
              <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>{t.key}</span>
              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.title}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {t.labels.slice(0, 2).map((l) => <Tag key={l}>{l}</Tag>)}
              </div>
              {t.due
                ? <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>{t.due}</span>
                : <span />
              }
              {(t.comments?.length ?? 0) > 0
                ? <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                    {I.comments?.({ size: 11 })} {t.comments?.length}
                  </span>
                : <span />
              }
              <Avatar user={t.assigned_to} size={18} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
