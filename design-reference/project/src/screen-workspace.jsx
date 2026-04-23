// Workspace view: header, settings-ish metadata, projects list/table.
// Used as the "landing" after clicking the workspace.

const WorkspaceView = ({ onProject }) => {
  const ws = WORKSPACES[0];
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");

  const filtered = PROJECTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "20px 28px 0", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 5,
      }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4 }}>
          WORKSPACE / <span style={{ color: "var(--text-2)" }}>{ws.slug}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}><I.layers size={22}/></span>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>{ws.name}</h1>
          <AvatarStack users={MEMBERS.slice(0, 5)} size={22}/>
          <div style={{ flex: 1 }}/>
          <Btn variant="secondary" icon={<I.settings size={13}/>}>Settings</Btn>
          <Btn variant="primary" icon={<I.plus size={13} stroke={2}/>}>New project</Btn>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {[
            { k: "projects", label: "Projects", count: PROJECTS.length, active: true },
            { k: "members", label: "Members", count: MEMBERS.length },
            { k: "activity", label: "Activity" },
            { k: "settings", label: "Settings" },
          ].map(t => (
            <button key={t.k} style={{
              padding: "8px 14px", fontSize: 12.5, fontWeight: 500,
              color: t.active ? "var(--text)" : "var(--text-3)",
              borderBottom: t.active ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
            }}>
              {t.label}
              {t.count != null && <span className="mono" style={{ color: "var(--text-4)", marginLeft: 6 }}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px" }}>
        <div style={{ width: 260 }}>
          <Input icon={<I.search size={13}/>} placeholder="Search projects…" value={query} onChange={e => setQuery(e.target.value)}/>
        </div>
        <Btn variant="ghost" icon={<I.filter size={13}/>}>Filter</Btn>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 5, padding: 2 }}>
          {[["grid", <I.layers size={13}/>], ["list", <I.list size={13}/>]].map(([k, icon]) => (
            <button key={k} onClick={() => setView(k)} style={{
              width: 26, height: 22, borderRadius: 3,
              background: view === k ? "var(--bg-2)" : "transparent",
              color: view === k ? "var(--text)" : "var(--text-3)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              boxShadow: view === k ? "var(--shadow-sm)" : "none",
            }}>{icon}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px 28px" }}>
        {view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {filtered.map(p => {
              const pct = Math.round(p.done / p.taskCount * 100);
              return (
                <button key={p._id} onClick={() => onProject(p)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  style={{
                    padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)", textAlign: "left", display: "flex", flexDirection: "column", gap: 14,
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <ProjectGlyph project={p} size={26}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
                      <div className="mono" style={{ color: "var(--text-3)" }}>{p.key}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                      <span>{p.done}/{p.taskCount} tasks</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: "var(--accent)" }}/>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AvatarStack users={MEMBERS.slice(0, 3)} size={18}/>
                    <div style={{ flex: 1 }}/>
                    <span className="mono" style={{ color: "var(--text-4)" }}>{p.updated} ago</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "24px 1.8fr 0.6fr 1.2fr 1fr 0.6fr", gap: 12, padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase" }}>
              <span/><span>Name</span><span>Key</span><span>Progress</span><span>Members</span><span style={{ textAlign: "right" }}>Updated</span>
            </div>
            {filtered.map(p => (
              <button key={p._id} onClick={() => onProject(p)}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ display: "grid", gridTemplateColumns: "24px 1.8fr 0.6fr 1.2fr 1fr 0.6fr", gap: 12, alignItems: "center", width: "100%", padding: "0 14px", height: 40, borderTop: "1px solid var(--border)", textAlign: "left" }}>
                <ProjectGlyph project={p} size={18}/>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                <span className="mono" style={{ color: "var(--text-3)" }}>{p.key}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden", maxWidth: 120 }}>
                    <div style={{ height: "100%", width: Math.round(p.done/p.taskCount*100) + "%", background: "var(--accent)" }}/>
                  </div>
                  <span className="mono" style={{ color: "var(--text-3)" }}>{p.done}/{p.taskCount}</span>
                </div>
                <AvatarStack users={MEMBERS.slice(0, 3)} size={18}/>
                <span className="mono" style={{ color: "var(--text-4)", textAlign: "right" }}>{p.updated}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { WorkspaceView });
