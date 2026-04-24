import { useState } from "react";
import {
  DndContext, DragOverlay, closestCorners,
  useDraggable, useDroppable,
  type DragEndEvent, type DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types/domain";
import { StatusDot, I } from "@/icons";
import { KanbanCard } from "./KanbanCard";
import { KanbanCompactCard } from "./KanbanCompactCard";
import { InlineNewTask } from "./InlineNewTask";

const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "todo",        label: "Todo"        },
  { key: "in_progress", label: "In Progress" },
  { key: "done",        label: "Done"        },
];

// ─── Droppable column ────────────────────────────────────────────────────────

interface ColumnProps {
  col: { key: TaskStatus; label: string };
  tasks: Task[];
  variant: "v1" | "v2";
  creating: TaskStatus | null;
  onStartCreate: (s: TaskStatus) => void;
  onAdd: (s: TaskStatus, title: string) => void;
  onCancelCreate: () => void;
  onOpen: (t: Task) => void;
  activeId: string | null;
}

function DroppableColumn({ col, tasks, variant, creating, onStartCreate, onAdd, onCancelCreate, onOpen, activeId }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: "0 0 300px", minWidth: 280,
        background: isOver ? "var(--accent-wash)" : "var(--bg-sub)",
        border: `1px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        display: "flex", flexDirection: "column",
        maxHeight: "calc(100vh - 200px)",
        transition: "background 0.08s, border-color 0.08s",
      }}
    >
      {/* Column header */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}>
        <StatusDot status={col.key} size={12} />
        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{col.label}</span>
        <span className="mono" style={{ color: "var(--text-4)" }}>{tasks.length}</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onStartCreate(col.key)}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          style={{ width: 20, height: 20, borderRadius: 4, color: "var(--text-3)", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
        >
          {I.plus({ size: 12, stroke: 2 })}
        </button>
      </div>

      {/* Cards */}
      <div style={{ padding: 8, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {tasks.map((t) =>
          variant === "v1"
            ? <KanbanCard key={t._id} task={t} onOpen={onOpen} isActive={activeId === t._id} />
            : <KanbanCompactCard key={t._id} task={t} onOpen={onOpen} />
        )}

        {creating === col.key && (
          <InlineNewTask
            onSubmit={(title) => onAdd(col.key, title)}
            onCancel={onCancelCreate}
          />
        )}

        {tasks.length === 0 && creating !== col.key && (
          <button
            onClick={() => onStartCreate(col.key)}
            style={{
              padding: "18px 12px", border: "1px dashed var(--border)",
              borderRadius: 6, color: "var(--text-3)", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "transparent", cursor: "pointer",
            }}
          >
            {I.plus({ size: 13, stroke: 2 })} Add task
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Board ───────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  variant: "v1" | "v2";
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onAdd: (status: TaskStatus, title: string) => void;
  onOpen: (t: Task) => void;
}

export function KanbanBoard({ tasks, variant, onMove, onAdd, onOpen }: KanbanBoardProps) {
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [creating, setCreating]   = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeTask = tasks.find((t) => t._id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;
    const newStatus = over.id as TaskStatus;
    if (newStatus !== task.status) onMove(task._id, newStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        padding: 16, display: "flex", gap: 12,
        overflowX: "auto", minHeight: "calc(100vh - 180px)",
        alignItems: "flex-start",
      }}>
        {STATUSES.map((col) => (
          <DroppableColumn
            key={col.key}
            col={col}
            tasks={tasks.filter((t) => t.status === col.key)}
            variant={variant}
            creating={creating}
            onStartCreate={setCreating}
            onAdd={(s, title) => { onAdd(s, title); setCreating(null); }}
            onCancelCreate={() => setCreating(null)}
            onOpen={onOpen}
            activeId={activeId}
          />
        ))}
      </div>

      {/* Drag overlay — shows floating card while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div style={{ transform: "rotate(2deg)", opacity: 0.95, pointerEvents: "none" }}>
            {variant === "v1"
              ? <KanbanCard task={activeTask} onOpen={() => {}} />
              : <KanbanCompactCard task={activeTask} onOpen={() => {}} />
            }
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
