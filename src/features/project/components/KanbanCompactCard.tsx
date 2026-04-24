import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/domain";
import { Avatar } from "@/components/shared/Avatar";
import { PriorityBars } from "@/icons";

interface KanbanCompactCardProps {
  task: Task;
  onOpen: (t: Task) => void;
}

export function KanbanCompactCard({ task, onOpen }: KanbanCompactCardProps) {
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
        padding: "6px 10px",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        cursor: "grab",
        display: "flex", alignItems: "center", gap: 8,
        touchAction: "none",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task)}
    >
      <PriorityBars level={task.priority} />
      <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>
        {task.key.split("-")[1] ?? task.key}
      </span>
      <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </span>
      {task.due && (
        <span className="mono" style={{ color: "var(--text-4)", fontSize: 10.5 }}>{task.due}</span>
      )}
      <Avatar user={task.assigned_to} size={16} />
    </div>
  );
}
