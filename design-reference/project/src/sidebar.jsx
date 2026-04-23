// Left sidebar: workspace switcher + nav + projects tree + bottom user/settings.

const Sidebar = ({ route, setRoute, onCmdK, onProject }) => {
  const activeWs = WORKSPACES[0];
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [favsOpen, setFavsOpen] = useState(true);
  const wsBtnRef = useRef(null);
  const [wsOpen, setWsOpen] = useState(false);

  const NavItem = ({ icon, label, count, routeKey, hotkey }) => {
    const active = route === routeKey;
    return (
      <button onClick={() => setRoute(routeKey)}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", height: 26, padding: "0 8px",
          borderRadius: 5,
          background: active ? "var(--bg-hover)" : "transparent",
          color: active ? "var(--text)" : "var(--text-2)",
          fontSize: 12.5, fontWeight: active ? 500 : 400,
          textAlign: "left", position: "relative",
        }}>
        <span style={{ color: active ? "var(--accent)" : "var(--text-3)", display: "inline-flex" }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {count != null && <span style={{ fontSize: 10.5, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>{count}</span>}
        {hotkey && <span className="kbd" style={{ opacity: 0.7 }}>{hotkey}</span>}
      </button>
    );
  };

  const SectionHeader = ({ open, setOpen, children, onAdd }) => (
    <div style={{ display: "flex", alignItems: "center", height: 22, padding: "0 8px", marginTop: 10, gap: 4 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 10.5, fontWeight: 500, letterSpacing: 0.3,
        color: "var(--text-3)", textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
      }}>
        <I.chevRight size={10} stroke={2} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.1s" }}/>
        {children}
      </button>
      <div style={{ flex: 1 }} />
      {onAdd && (
        <button onClick={onAdd}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{ width: 18, height: 18, borderRadius: 4, color: "var(--text-3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <I.plus size={12} stroke={2}/>
        </button>
      )}
    </div>
  );

  return (
    <aside style={{
      width: 232, flex: "0 0 232px",
      borderRight: "1px solid var(--border)",
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Workspace switcher */}
      <div style={{ padding: 8, paddingBottom: 0 }}>
        <button ref={wsBtnRef} onClick={() => setWsOpen(true)}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            height: 34, padding: "0 8px", borderRadius: 6,
          }}>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}><I.logo size={18}/></span>
          <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600 }}>{activeWs.name}</span>
          <I.chevDown size={12} stroke={2} style={{ color: "var(--text-3)" }}/>
        </button>
        <Popover anchor={wsBtnRef} open={wsOpen} onClose={() => setWsOpen(false)} width={228}>
          <div style={{ padding: "4px 8px 6px", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase" }}>Workspaces</div>
          {WORKSPACES.map(w => (
            <MenuItem key={w._id} icon={<I.layers size={13}/>} selected={w._id === activeWs._id}>{w.name}</MenuItem>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <MenuItem icon={<I.plus size={13}/>}>Create workspace</MenuItem>
          <MenuItem icon={<I.settings size={13}/>}>Workspace settings</MenuItem>
          <MenuItem icon={<I.logout size={13}/>} onClick={() => setRoute("login")}>Sign out</MenuItem>
        </Popover>
      </div>

      {/* Search / Cmd K */}
      <div style={{ padding: 8 }}>
        <button onClick={onCmdK}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--bg-sub)"}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            height: 28, padding: "0 8px", borderRadius: 6,
            background: "var(--bg-sub)", color: "var(--text-3)", fontSize: 12.5,
            border: "1px solid var(--border)",
          }}>
          <I.search size={13}/>
          <span style={{ flex: 1, textAlign: "left" }}>Search or jump to…</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>

      {/* Main nav */}
      <nav style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <NavItem icon={<I.inbox size={14}/>}  label="Inbox"    routeKey="dashboard" count={3} />
        <NavItem icon={<I.home size={14}/>}   label="Home"     routeKey="dashboard" />
        <NavItem icon={<I.activity size={14}/>} label="My tasks" routeKey="dashboard" count={7} />
      </nav>

      {/* Favorites */}
      <SectionHeader open={favsOpen} setOpen={setFavsOpen}>Favorites</SectionHeader>
      {favsOpen && (
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          {PROJECTS.slice(0, 2).map(p => (
            <button key={p._id} onClick={() => onProject(p)}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                height: 26, padding: "0 8px", borderRadius: 5,
                color: "var(--text-2)", fontSize: 12.5, textAlign: "left",
              }}>
              <ProjectGlyph project={p} size={16} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Projects */}
      <SectionHeader open={projectsOpen} setOpen={setProjectsOpen} onAdd={() => {}}>Projects</SectionHeader>
      {projectsOpen && (
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1, overflow: "auto", flex: 1 }}>
          {PROJECTS.map(p => (
            <button key={p._id} onClick={() => onProject(p)}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                height: 26, padding: "0 8px", borderRadius: 5,
                color: "var(--text-2)", fontSize: 12.5, textAlign: "left",
              }}>
              <ProjectGlyph project={p} size={16} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              <span style={{ fontSize: 10.5, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>{p.taskCount}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom */}
      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", padding: 8, display: "flex", flexDirection: "column", gap: 1 }}>
        <NavItem icon={<I.users size={14}/>}   label="Members"  routeKey="members" />
        <NavItem icon={<I.settings size={14}/>} label="Settings" routeKey="settings" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginTop: 2 }}>
          <Avatar user={ME} size={20} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ME.name}</div>
            <div className="mono" style={{ color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ME.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { Sidebar });
