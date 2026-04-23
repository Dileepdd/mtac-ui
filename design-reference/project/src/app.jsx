// Main app: router, shell, tweaks integration, cmd-k.

const App = () => {
  // Hash routing for canvas iframes + persistence
  const initialHash = (typeof location !== "undefined" && location.hash.slice(1)) || "";
  const hashRoute = {
    "login": { route: "login" },
    "register": { route: "register" },
    "forgot": { route: "forgot" },
    "dashboard": { route: "dashboard" },
    "dashboard-focus": { route: "dashboard", focus: true },
    "workspace": { route: "workspace" },
    "project": { route: "project" },
    "project-compact": { route: "project", kanban: "v2" },
    "project-list": { route: "project", view: "list" },
    "task-open": { route: "project", openTask: TASKS[0] },
    "members": { route: "members" },
    "roles": { route: "members", tab: "roles" },
    "settings": { route: "settings" },
    "keyboard": { route: "settings", section: "keyboard" },
    "cmdk": { route: "dashboard", cmdk: true },
  }[initialHash];

  const [route, setRoute] = useState(() => hashRoute?.route || localStorage.getItem("mtac:route") || "dashboard");
  const [projectId, setProjectId] = useState(() => localStorage.getItem("mtac:projectId") || PROJECTS[0]._id);
  const [cmdk, setCmdk] = useState(() => !!hashRoute?.cmdk);
  const [tweaks, setTweaks] = useState(false);
  const [taskOpen, setTaskOpen] = useState(() => hashRoute?.openTask || null);

  // Expose hashRoute so children can read initial variant/tab/section
  if (typeof window !== "undefined") window.__mtac_initial = hashRoute;

  useEffect(() => { localStorage.setItem("mtac:route", route); }, [route]);
  useEffect(() => { localStorage.setItem("mtac:projectId", projectId); }, [projectId]);

  // Global keyboard
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdk(true); }
      if (e.key === "Escape") setCmdk(false);
      // Letter shortcuts when not typing
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target?.tagName);
      if (!typing && !e.metaKey && !e.ctrlKey) {
        if (e.key === "c") { e.preventDefault(); /* create task */ }
        if (e.key === "/") { e.preventDefault(); setCmdk(true); }
        if (e.key === "?") { e.preventDefault(); setRoute("settings"); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Tweaks host protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaks(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaks(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const project = PROJECTS.find(p => p._id === projectId) || PROJECTS[0];
  const isAuth = ["login", "register", "forgot"].includes(route);

  const go = (r) => setRoute(r);
  const goProject = (p) => { setProjectId(p._id); setRoute("project"); };

  return (
    <>
      {isAuth ? (
        route === "login" ? <Login setRoute={go}/>
          : route === "register" ? <Register setRoute={go}/>
          : <Forgot setRoute={go}/>
      ) : (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
          <Sidebar route={route} setRoute={go} onCmdK={() => setCmdk(true)} onProject={goProject}/>
          <main style={{ flex: 1, minWidth: 0 }}>
            {route === "dashboard" && <Dashboard setRoute={go} onProject={goProject} onOpenTask={(t) => setTaskOpen(t)}/>}
            {route === "workspace" && <WorkspaceView onProject={goProject}/>}
            {route === "project" && <ProjectView project={project} onOpenTask={(t) => setTaskOpen(t)} goBack={() => go("workspace")}/>}
            {route === "members" && <MembersScreen/>}
            {route === "settings" && <SettingsScreen setRoute={go}/>}
          </main>
        </div>
      )}

      <CmdK open={cmdk} onClose={() => setCmdk(false)} setRoute={go} onProject={goProject} onOpenTask={(t) => setTaskOpen(t)}/>
      <TaskModal task={taskOpen} open={!!taskOpen} onClose={() => setTaskOpen(null)}/>
      <TweaksPanel open={tweaks} onClose={() => { setTweaks(false); try { window.parent.postMessage({ type: "__edit_mode_done" }, "*"); } catch {} }}/>

      {/* Dev nav - quick jump bar for prototype (not tweak-mode) */}
      {!isAuth && !tweaks && (
        <div style={{
          position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 2, padding: 3,
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: 10, boxShadow: "var(--shadow-md)", zIndex: 50, fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}>
          {[
            ["login", "Auth"],
            ["dashboard", "Dashboard"],
            ["workspace", "Workspace"],
            ["project", "Project"],
            ["members", "Members"],
            ["settings", "Settings"],
          ].map(([r, label]) => (
            <button key={r} onClick={() => go(r)} style={{
              padding: "4px 10px", borderRadius: 7, fontWeight: 500,
              background: route === r ? "var(--accent-wash)" : "transparent",
              color: route === r ? "var(--accent)" : "var(--text-3)",
            }}>{label}</button>
          ))}
          <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 4px" }}/>
          <button onClick={() => setCmdk(true)} style={{ padding: "4px 10px", color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ⌘K
          </button>
          <a href="canvas.html" style={{ padding: "4px 10px", color: "var(--text-3)", textDecoration: "none" }}>Canvas →</a>
        </div>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
