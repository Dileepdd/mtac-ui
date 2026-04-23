// Project view: Kanban board (primary) + list view toggle + variation toggle.
// Inline task creation, drag-drop between columns, filters & search.

const STATUSES = [
  { key: "todo", label: "Todo", color: "var(--status-todo)" },
  { key: "in_progress", label: "In Progress", color: "var(--status-progress)" },
  { key: "done", label: "Done", color: "var(--status-done)" },
];

const ProjectView = ({ project, onOpenTask, goBack }) => {
  const [tasks, setTasks] = useState(TASKS.filter(t => t.projectId === project._id));
  const [view, setView] = useState(window.__mtac_initial?.view || "board"); // board | list
  const [kanbanVariant, setKanbanVariant] = useState(window.__mtac_initial?.kanban || "v1");
  const [query, setQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [creating, setCreating] = useState(null); // status key where we're creating

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) &&
    (!filterAssignee || t.assigned_to === filterAssignee)
  );

  const moveTask = (id, newStatus) => {
    setTasks(ts => ts.map(t => t._id === id ? { ...t, status: newStatus } : t));
  };

  const addTask = (status, title) => {
    if (!title.trim()) return;
    const num = Math.max(...tasks.map(t => parseInt(t.key.split("-")[1]))) + 1;
    setTasks(ts => [...ts, {
      _id: "t_new_" + Date.now(),
      projectId: project._id,
      key: project.key + "-" + num,
      title: title.trim(),
      description: "",
      status,
      assigned_to: null,
      priority: "med",
      labels: [],
      due: null,
      comments: 0,
    }]);
  };

  const byStatus = (s) => filtered.filter(t => t.status === s);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={goBack} style={{ color: "var(--text-3)" }}>WORKSPACE</button>
          <I.chevRight size={10} stroke={2}/>
          <span style={{ color: "var(--text-2)" }}>{project.key}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <ProjectGlyph project={project} size={24}/>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>{project.name}</h1>
          <span className="mono" style={{ color: "var(--text-3)" }}>{project.key}</span>
          <AvatarStack users={MEMBERS.slice(0, 4)} size={20}/>
          <div style={{ flex: 1 }}/>
          <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
            {[["board", <I.board size={13}/>, "Board"], ["list", <I.list size={13}/>, "List"]].map(([k, icon, label]) => (
              <button key={k} onClick={() => setView(k)} style={{
                padding: "0 10px", height: 22, borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 5,
                background: view === k ? "var(--bg-2)" : "transparent",
                color: view === k ? "var(--text)" : "var(--text-3)",
                fontSize: 11.5, fontWeight: 500,
                boxShadow: view === k ? "var(--shadow-sm)" : "none",
              }}>{icon} {label}</button>
            ))}
          </div>
          <Btn variant="primary" icon={<I.plus size={13} stroke={2}/>} kbd="C" onClick={() => setCreating("todo")}>New task</Btn>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 240 }}>
          <Input icon={<I.search size={13}/>} placeholder="Search tasks…" value={query} onChange={e => setQuery(e.target.value)}/>
        </div>
        <Btn variant="ghost" icon={<I.filter size={13}/>}>Filter</Btn>
        {/* Assignee filter chips */}
        <div style={{ display: "inline-flex", gap: 2 }}>
          <button onClick={() => setFilterAssignee(null)} style={{
            width: 24, height: 24, borderRadius: "50%",
            background: filterAssignee === null ? "var(--accent-wash)" : "transparent",
            border: filterAssignee === null ? "1px solid var(--accent)" : "1px dashed var(--border)",
            color: "var(--text-3)", fontSize: 10, fontFamily: "var(--font-mono)",
          }}>ALL</button>
          {MEMBERS.slice(0, 5).map(m => (
            <button key={m._id} onClick={() => setFilterAssignee(filterAssignee === m._id ? null : m._id)} style={{
              opacity: !filterAssignee || filterAssignee === m._id ? 1 : 0.35, padding: 1,
              borderRadius: "50%", outline: filterAssignee === m._id ? "1.5px solid var(--accent)" : "none", outlineOffset: 1,
            }}>
              <Avatar user={m} size={22}/>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        {view === "board" && (
          <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
            {["v1", "v2"].map(v => (
              <button key={v} onClick={() => setKanbanVariant(v)} style={{
                padding: "0 10px", height: 22, borderRadius: 3,
                background: kanbanVariant === v ? "var(--bg-2)" : "transparent",
                color: kanbanVariant === v ? "var(--text)" : "var(--text-3)",
                fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
                boxShadow: kanbanVariant === v ? "var(--shadow-sm)" : "none",
              }}>{v === "v1" ? "CARDS" : "COMPACT"}</button>
            ))}
          </div>
        )}
        <Btn variant="ghost" icon={<I.more size={14}/>}/>
      </div>

      {/* Body */}
      {view === "board" ? (
        <KanbanBoard
          variant={kanbanVariant}
          tasksByStatus={STATUSES.map(s => ({ ...s, tasks: byStatus(s.key) }))}
          allTasks={filtered}
          onMove={moveTask}
          onOpen={onOpenTask}
          dragTaskId={dragTaskId} setDragTaskId={setDragTaskId}
          dragOverCol={dragOverCol} setDragOverCol={setDragOverCol}
          creating={creating} setCreating={setCreating}
          onAdd={addTask}
        />
      ) : (
        <ListView tasks={filtered} onOpen={onOpenTask} onMove={moveTask}/>
      )}
    </div>
  );
};

// --- Kanban Board ---
const KanbanBoard = ({ variant, tasksByStatus, onMove, onOpen, dragTaskId, setDragTaskId, dragOverCol, setDragOverCol, creating, setCreating, onAdd }) => {
  return (
    <div style={{ padding: 16, display: "flex", gap: 12, overflowX: "auto", minHeight: "calc(100vh - 180px)", alignItems: "flex-start" }}>
      {tasksByStatus.map(col => (
        <div key={col.key}
          onDragOver={e => { e.preventDefault(); setDragOverCol(col.key); }}
          onDragLeave={() => setDragOverCol(c => c === col.key ? null : c)}
          onDrop={() => { if (dragTaskId) onMove(dragTaskId, col.key); setDragTaskId(null); setDragOverCol(null); }}
          data-drag-over={dragOverCol === col.key}
          style={{
            flex: "0 0 300px", minWidth: 280,
            background: dragOverCol === col.key ? "var(--accent-wash)" : "var(--bg-sub)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)",
            display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 200px)",
            transition: "background 0.08s",
          }}>
          {/* Column header */}
          <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}>
            <StatusDot status={col.key} size={12}/>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{col.label}</span>
            <span className="mono" style={{ color: "var(--text-4)" }}>{col.tasks.length}</span>
            <div style={{ flex: 1 }}/>
            <button onClick={() => setCreating(col.key)}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{ width: 20, height: 20, borderRadius: 4, color: "var(--text-3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <I.plus size={12} stroke={2}/>
            </button>
          </div>
          {/* Cards */}
          <div style={{ padding: 8, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            {col.tasks.map(t => (
              variant === "v1"
                ? <KanbanCard key={t._id} task={t} onOpen={onOpen} dragTaskId={dragTaskId} setDragTaskId={setDragTaskId}/>
                : <KanbanCompactCard key={t._id} task={t} onOpen={onOpen} dragTaskId={dragTaskId} setDragTaskId={setDragTaskId}/>
            ))}
            {creating === col.key && (
              <InlineNewTask onSubmit={(title) => { onAdd(col.key, title); setCreating(null); }} onCancel={() => setCreating(null)}/>
            )}
            {col.tasks.length === 0 && creating !== col.key && (
              <button onClick={() => setCreating(col.key)}
                style={{
                  padding: "18px 12px", border: "1px dashed var(--border)",
                  borderRadius: 6, color: "var(--text-3)", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                <I.plus size={13} stroke={2}/> Add task
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const InlineNewTask = ({ onSubmit, onCancel }) => {
  const [val, setVal] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div style={{ padding: 10, background: "var(--bg-2)", border: "1px solid var(--accent)", borderRadius: 6, boxShadow: "var(--shadow-sm)" }}>
      <textarea ref={ref} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(val); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        placeholder="What needs to be done?"
        style={{
          width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", fontSize: 13, lineHeight: 1.4, color: "var(--text)",
          minHeight: 38, fontFamily: "inherit",
        }}/>
      <div style={{ display: "flex", alignItems: "center", marginTop: 8, fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
        <span>ENTER to save · ESC to cancel</span>
        <div style={{ flex: 1 }}/>
        <button onClick={() => onSubmit(val)} style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}>ADD →</button>
      </div>
    </div>
  );
};

// Variant 1 — detailed card
const KanbanCard = ({ task, onOpen, dragTaskId, setDragTaskId }) => {
  const assignee = lookupMember(task.assigned_to);
  return (
    <div draggable
      onDragStart={() => setDragTaskId(task._id)}
      onDragEnd={() => setDragTaskId(null)}
      onClick={() => onOpen(task)}
      data-dragging={dragTaskId === task._id}
      style={{
        padding: 10, background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 6, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
        transition: "border-color 0.08s, box-shadow 0.08s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="mono" style={{ color: "var(--text-3)" }}>{task.key}</span>
        <div style={{ flex: 1 }}/>
        <PriorityBars level={task.priority}/>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--text)" }}>{task.title}</div>
      {task.labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {task.labels.map(l => <Tag key={l}>{l}</Tag>)}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        {task.due && (
          <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3 }}>
            <I.calendar size={11}/> {task.due}
          </span>
        )}
        {task.comments > 0 && (
          <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3 }}>
            <I.comments size={11}/> {task.comments}
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <Avatar user={assignee} size={20}/>
      </div>
    </div>
  );
};

// Variant 2 — compact card (denser)
const KanbanCompactCard = ({ task, onOpen, dragTaskId, setDragTaskId }) => {
  const assignee = lookupMember(task.assigned_to);
  return (
    <div draggable
      onDragStart={() => setDragTaskId(task._id)}
      onDragEnd={() => setDragTaskId(null)}
      onClick={() => onOpen(task)}
      data-dragging={dragTaskId === task._id}
      style={{
        padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <PriorityBars level={task.priority} size={10}/>
      <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>{task.key.split("-")[1]}</span>
      <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
      {task.due && <span className="mono" style={{ color: "var(--text-4)", fontSize: 10.5 }}>{task.due}</span>}
      <Avatar user={assignee} size={16}/>
    </div>
  );
};

// List view
const ListView = ({ tasks, onOpen, onMove }) => {
  const grouped = STATUSES.map(s => ({ ...s, tasks: tasks.filter(t => t.status === s.key) }));
  return (
    <div style={{ padding: "12px 28px 28px" }}>
      {grouped.map(g => (
        <div key={g.key} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 8px", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
            <StatusDot status={g.key} size={12}/>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{g.label}</span>
            <span className="mono" style={{ color: "var(--text-4)" }}>{g.tasks.length}</span>
          </div>
          {g.tasks.map(t => {
            const a = lookupMember(t.assigned_to);
            return (
              <div key={t._id} onClick={() => onOpen(t)}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{
                  display: "grid", gridTemplateColumns: "14px 14px 60px 1fr auto auto auto auto", gap: 10, alignItems: "center",
                  padding: "0 8px", height: 34, borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}>
                <PriorityBars level={t.priority}/>
                <StatusDot status={t.status} size={12}/>
                <span className="mono" style={{ color: "var(--text-3)" }}>{t.key}</span>
                <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {t.labels.slice(0, 2).map(l => <Tag key={l}>{l}</Tag>)}
                </div>
                {t.due ? <span className="mono" style={{ color: "var(--text-3)" }}>{t.due}</span> : <span/>}
                {t.comments > 0 ? <span className="mono" style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3 }}><I.comments size={11}/>{t.comments}</span> : <span/>}
                <Avatar user={a} size={18}/>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { ProjectView });
