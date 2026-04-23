// Task detail modal — opens from anywhere; inline edit everything.

const TaskModal = ({ task, open, onClose, onUpdate }) => {
  const [local, setLocal] = useState(task);
  const [newComment, setNewComment] = useState("");

  useEffect(() => { if (task) setLocal(task); }, [task]);

  const statusRef = useRef(null); const [statusOpen, setStatusOpen] = useState(false);
  const assignRef = useRef(null); const [assignOpen, setAssignOpen] = useState(false);
  const prioRef = useRef(null);   const [prioOpen, setPrioOpen] = useState(false);

  if (!open || !local) return null;

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onUpdate?.(next);
  };

  const assignee = lookupMember(local.assigned_to);
  const project = lookupProject(local.projectId);

  const comments = [
    { id: "c1", actor: "u_02", text: "Do we want the CTA in orange for this one? Trying to match the new email subject line.", time: "2h" },
    { id: "c2", actor: "u_03", text: "Yeah, let's go with orange. Matches the landing page too.", time: "1h" },
    { id: "c3", actor: "u_01", text: "Great. @kai ship when ready.", time: "14m" },
  ].slice(0, Math.min(local.comments || 0, 3));

  return (
    <Modal open={open} onClose={onClose} width={780}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <ProjectGlyph project={project} size={18}/>
        <span className="mono" style={{ color: "var(--text-3)" }}>{project.name} / {local.key}</span>
        <div style={{ flex: 1 }}/>
        <Btn variant="ghost" icon={<I.copy size={13}/>}/>
        <Btn variant="ghost" icon={<I.link size={13}/>}/>
        <Btn variant="ghost" icon={<I.more size={14}/>}/>
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }}/>
        <Btn variant="ghost" icon={<I.x size={13}/>} onClick={onClose}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px" }}>
        {/* Main */}
        <div style={{ padding: "20px 24px", minHeight: 360, borderRight: "1px solid var(--border)" }}>
          {/* Title */}
          <textarea value={local.title} onChange={e => update({ title: e.target.value })} style={{
            width: "100%", border: "none", outline: "none", resize: "none",
            background: "transparent", color: "var(--text)",
            fontSize: 20, fontWeight: 500, letterSpacing: -0.02, lineHeight: 1.25,
            fontFamily: "inherit", padding: 0, minHeight: 30,
          }}/>
          {/* Description */}
          <textarea
            value={local.description || ""}
            onChange={e => update({ description: e.target.value })}
            placeholder="Add a description… (supports /commands)"
            style={{
              width: "100%", marginTop: 8, border: "none", outline: "none", resize: "vertical",
              background: "transparent", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6,
              fontFamily: "inherit", minHeight: 80, padding: 0,
            }}/>

          {/* Comments */}
          <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>Activity · {comments.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {comments.map(c => {
                const actor = lookupMember(c.actor);
                return (
                  <div key={c.id} style={{ display: "flex", gap: 10 }}>
                    <Avatar user={actor} size={24}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{actor.name}</span>
                        <span className="mono" style={{ color: "var(--text-4)" }}>{c.time} ago</span>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-2)", marginTop: 2 }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
              {/* System events */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 12 }}>
                <div style={{ width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <StatusDot status="in_progress" size={10}/>
                </div>
                <span><strong style={{ color: "var(--text-2)", fontWeight: 500 }}>Kai</strong> moved this to <span style={{ color: "var(--status-progress)" }}>In Progress</span></span>
                <div style={{ flex: 1 }}/>
                <span className="mono" style={{ color: "var(--text-4)" }}>3h ago</span>
              </div>
            </div>

            {/* New comment */}
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Avatar user={ME} size={24}/>
              <div style={{ flex: 1, padding: 10, background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 6 }}>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Leave a comment…" style={{
                  width: "100%", border: "none", outline: "none", resize: "none",
                  background: "transparent", color: "var(--text)", fontSize: 13, lineHeight: 1.5,
                  fontFamily: "inherit", minHeight: 44,
                }}/>
                <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
                  <Btn variant="ghost" icon={<I.paperclip size={13}/>}/>
                  <div style={{ flex: 1 }}/>
                  <span className="mono" style={{ color: "var(--text-4)", marginRight: 8 }}>⌘ + ENTER</span>
                  <Btn variant="primary" disabled={!newComment.trim()} onClick={() => setNewComment("")}>Comment</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, background: "var(--bg-sub)" }}>
          {/* Status */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6 }}>Status</div>
            <button ref={statusRef} onClick={() => setStatusOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 5, fontSize: 12.5,
            }}>
              <StatusDot status={local.status} size={12}/>
              <span>{STATUS_LABELS[local.status]}</span>
              <div style={{ flex: 1 }}/>
              <I.chevDown size={11} stroke={2} style={{ color: "var(--text-3)" }}/>
            </button>
            <Popover anchor={statusRef} open={statusOpen} onClose={() => setStatusOpen(false)}>
              {["todo", "in_progress", "done"].map(s => (
                <MenuItem key={s} icon={<StatusDot status={s} size={11}/>} selected={s === local.status} onClick={() => { update({ status: s }); setStatusOpen(false); }}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Assignee */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6 }}>Assignee</div>
            <button ref={assignRef} onClick={() => setAssignOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 5, fontSize: 12.5,
            }}>
              <Avatar user={assignee} size={18}/>
              <span>{assignee?.name || "Unassigned"}</span>
              <div style={{ flex: 1 }}/>
              <I.chevDown size={11} stroke={2} style={{ color: "var(--text-3)" }}/>
            </button>
            <Popover anchor={assignRef} open={assignOpen} onClose={() => setAssignOpen(false)} width={220}>
              <MenuItem icon={<div style={{ width: 14, height: 14, borderRadius: "50%", border: "1px dashed var(--border-strong)" }}/>} selected={!local.assigned_to} onClick={() => { update({ assigned_to: null }); setAssignOpen(false); }}>Unassigned</MenuItem>
              {MEMBERS.map(m => (
                <MenuItem key={m._id} icon={<Avatar user={m} size={14}/>} selected={m._id === local.assigned_to} onClick={() => { update({ assigned_to: m._id }); setAssignOpen(false); }}>{m.name}</MenuItem>
              ))}
            </Popover>
          </div>

          {/* Priority */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6 }}>Priority</div>
            <button ref={prioRef} onClick={() => setPrioOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 5, fontSize: 12.5, textTransform: "capitalize",
            }}>
              <PriorityBars level={local.priority}/>
              <span>{local.priority}</span>
              <div style={{ flex: 1 }}/>
              <I.chevDown size={11} stroke={2} style={{ color: "var(--text-3)" }}/>
            </button>
            <Popover anchor={prioRef} open={prioOpen} onClose={() => setPrioOpen(false)}>
              {["urgent", "high", "med", "low", "none"].map(p => (
                <MenuItem key={p} icon={<PriorityBars level={p}/>} selected={p === local.priority} onClick={() => { update({ priority: p }); setPrioOpen(false); }}>
                  <span style={{ textTransform: "capitalize" }}>{p}</span>
                </MenuItem>
              ))}
            </Popover>
          </div>

          {/* Due */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6 }}>Due</div>
            <button style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "6px 10px", background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 5, fontSize: 12.5, color: local.due ? "var(--text)" : "var(--text-3)",
            }}>
              <I.calendar size={13}/>
              <span>{local.due || "No date"}</span>
            </button>
          </div>

          {/* Labels */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 6 }}>Labels</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {local.labels.map(l => <Tag key={l}>{l}</Tag>)}
              <button style={{ padding: "0 6px", height: 18, fontSize: 11, color: "var(--text-3)", border: "1px dashed var(--border-strong)", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 3 }}>
                <I.plus size={10} stroke={2}/> Add
              </button>
            </div>
          </div>

          {/* Meta */}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: 10.5, lineHeight: 1.8 }}>
              <div>CREATED · 3d ago</div>
              <div>UPDATED · 12m ago</div>
              <div>ID · {local._id}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

Object.assign(window, { TaskModal });
