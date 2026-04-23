// Cmd+K command palette.

const CmdK = ({ open, onClose, setRoute, onProject, onOpenTask }) => {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setI(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const items = useMemo(() => {
    const base = [
      { type: "nav", label: "Go to Home",      hint: "G H", icon: <I.home size={13}/>, run: () => setRoute("dashboard") },
      { type: "nav", label: "Go to My tasks",  hint: "G T", icon: <I.activity size={13}/>, run: () => setRoute("dashboard") },
      { type: "nav", label: "Go to Members",   hint: "G M", icon: <I.users size={13}/>, run: () => setRoute("members") },
      { type: "nav", label: "Go to Settings",  hint: "G S", icon: <I.settings size={13}/>, run: () => setRoute("settings") },
      { type: "action", label: "New task",     hint: "C",   icon: <I.plus size={13}/>, run: () => onOpenTask(TASKS[0]) },
      { type: "action", label: "New project",  hint: "⇧ P", icon: <I.folder size={13}/>, run: () => {} },
      { type: "action", label: "Invite member", hint: "⇧ I", icon: <I.users size={13}/>, run: () => setRoute("members") },
      { type: "action", label: "Toggle theme",  hint: "⇧ D", icon: <I.moon size={13}/>,  run: () => {
        const el = document.documentElement;
        const cur = el.getAttribute("data-theme") || "light";
        el.setAttribute("data-theme", cur === "light" ? "dark" : "light");
      }},
      ...PROJECTS.map(p => ({
        type: "project", label: p.name,
        hint: p.key, icon: <ProjectGlyph project={p} size={14} />,
        run: () => onProject(p)
      })),
      ...TASKS.slice(0, 8).map(t => ({
        type: "task", label: t.title,
        hint: t.key, icon: <StatusDot status={t.status} size={11}/>,
        run: () => onOpenTask(t)
      })),
    ];
    if (!q) return base;
    return base.filter(it => it.label.toLowerCase().includes(q.toLowerCase()) || it.hint?.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setI(x => Math.min(items.length - 1, x + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setI(x => Math.max(0, x - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); items[i]?.run(); onClose(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, items, i, onClose]);

  useEffect(() => { setI(0); }, [q]);

  if (!open) return null;

  // Group items
  const groups = {};
  items.forEach((it, idx) => {
    const g = { nav: "Navigation", action: "Actions", project: "Projects", task: "Tasks" }[it.type];
    if (!groups[g]) groups[g] = [];
    groups[g].push({ ...it, idx });
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 120,
      background: "rgba(15,15,15,0.35)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh", animation: "fade-in 0.1s ease-out",
    }} onMouseDown={onClose}>
      <div onMouseDown={e => e.stopPropagation()} style={{
        width: 560, maxWidth: "92vw",
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
        overflow: "hidden", animation: "modal-in 0.14s ease-out",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
          <I.search size={15} style={{ color: "var(--text-3)" }}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search projects, tasks, or run a command…"
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              fontSize: 14, color: "var(--text)",
            }}/>
          <span className="kbd">ESC</span>
        </div>
        <div style={{ maxHeight: 420, overflow: "auto", padding: 6 }}>
          {items.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-3)", fontSize: 12.5 }}>No results for "{q}"</div>
          )}
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <div style={{ padding: "8px 10px 4px", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3 }}>{group}</div>
              {list.map(it => (
                <button key={it.idx} onClick={() => { it.run(); onClose(); }}
                  onMouseEnter={() => setI(it.idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    height: 32, padding: "0 10px", borderRadius: 6,
                    background: i === it.idx ? "var(--bg-hover)" : "transparent",
                    color: "var(--text)", fontSize: 13, textAlign: "left",
                  }}>
                  <span style={{ color: "var(--text-3)", display: "inline-flex" }}>{it.icon}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
                  {it.hint && <span className="kbd">{it.hint}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "8px 14px", borderTop: "1px solid var(--border)",
          fontSize: 11, color: "var(--text-3)", background: "var(--bg-sub)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span className="kbd">↵</span> open</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span className="kbd">ESC</span> close</span>
          <div style={{ flex: 1 }} />
          <span className="mono">MTAC · v3.2.1</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CmdK });
