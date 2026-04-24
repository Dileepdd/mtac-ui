import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/domain";
import { Avatar } from "@/components/shared/Avatar";
import { Tag } from "@/components/shared/Tag";
import { PriorityBars, StatusDot, I } from "@/icons";

interface KanbanCardProps {
  task: Task;
  onOpen: (t: Task) => void;
  isActive?: boolean;
}

export function KanbanCard({ task, onOpen, isActive }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: 10,
        background: "var(--bg-2)",
        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 6,
        cursor: "grab",
        display: "flex", flexDirection: "column", gap: 8,
        transition: "border-color 0.08s, box-shadow 0.08s",
        touchAction: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isActive ? "var(--accent)" : "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>{task.key}</span>
        <div style={{ flex: 1 }} />
        <PriorityBars level={task.priority} />
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--text)" }}>{task.title}</div>

      {task.labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {task.labels.map((l) => <Tag key={l}>{l}</Tag>)}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        {task.due && (
          <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5 }}>
            {I.calendar({ size: 11 })} {task.due}
          </span>
        )}
        {(task.comments?.length ?? 0) > 0 && (
          <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5 }}>
            {I.comments?.({ size: 11 })} {task.comments?.length}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <Avatar user={task.assigned_to} size={20} />
      </div>
    </div>
  );
}
