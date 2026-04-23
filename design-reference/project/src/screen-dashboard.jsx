// Dashboard / Home screen — two variations via tabs.

const StatCard = ({ label, value, delta, unit, hint }) => (
  <div style={{
    padding: "14px 16px", background: "var(--bg-2)",
    border: "1px solid var(--border)", borderRadius: "var(--radius)",
    display: "flex", flexDirection: "column", gap: 4, minWidth: 0,
  }}>
    <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.03 }}>{value}</span>
      {unit && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{unit}</span>}
    </div>
    {delta != null && (
      <div style={{ fontSize: 11, color: delta >= 0 ? "var(--status-done)" : "#dc2626", fontFamily: "var(--font-mono)" }}>
        {delta >= 0 ? "+" : ""}{delta}%  <span style={{ color: "var(--text-4)" }}>vs last week</span>
      </div>
    )}
    {hint && <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{hint}</div>}
  </div>
);

const Dashboard = ({ setRoute, onProject, onOpenTask }) => {
  const [variant, setVariant] = useState(window.__mtac_initial?.focus ? "v2" : "v1");

  const Header = () => (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "16px 28px", borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, background: "var(--bg)", zIndex: 5,
    }}>
      <div>
        <div className="mono" style={{ color: "var(--text-3)" }}>Tuesday · Nov 10</div>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.015 }}>Good morning, Elena</div>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: "flex", background: "var(--bg-sub)", border: "1px solid var(--border)", borderRadius: 6, padding: 2 }}>
        {["v1", "v2"].map(v => (
          <button key={v} onClick={() => setVariant(v)} style={{
            height: 24, padding: "0 10px", borderRadius: 4, fontSize: 11.5, fontWeight: 500,
            background: variant === v ? "var(--bg-2)" : "transparent",
            color: variant === v ? "var(--text)" : "var(--text-3)",
            fontFamily: "var(--font-mono)",
            boxShadow: variant === v ? "var(--shadow-sm)" : "none",
          }}>{v === "v1" ? "OVERVIEW" : "FOCUS"}</button>
        ))}
      </div>
      <Btn variant="secondary" icon={<I.plus size={13} stroke={2}/>}>New</Btn>
    </div>
  );

  if (variant === "v2") return <DashboardFocus Header={Header} setRoute={setRoute} onProject={onProject} onOpenTask={onOpenTask}/>;

  // Variant 1: Overview — stats + projects grid + activity
  const myTasks = TASKS.filter(t => t.assigned_to === ME._id && t.status !== "done").slice(0, 6);
  const ws = WORKSPACES[0];

  return (
    <div>
      <Header/>
      <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          <StatCard label="Active projects" value={ws.projectCount} delta={16}/>
          <StatCard label="Open tasks" value={ws.taskCount - 36} delta={-4}/>
          <StatCard label="Completed this week" value={14} delta={38}/>
          <StatCard label="Team members" value={ws.memberCount} hint="3 online now"/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Projects */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3 }}>Projects</div>
              <div style={{ flex: 1 }}/>
              <button style={{ fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>All projects →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PROJECTS.map(p => {
                const pct = Math.round(p.done / p.taskCount * 100);
                return (
                  <button key={p._id} onClick={() => onProject(p)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    style={{
                      padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius)", textAlign: "left", display: "flex", flexDirection: "column", gap: 10,
                      transition: "border-color 0.1s",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProjectGlyph project={p} size={22}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div className="mono" style={{ color: "var(--text-3)" }}>{p.key} · {p.updated} ago</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                        <span>{p.done} / {p.taskCount} tasks</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: "var(--bg-sub)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: "var(--accent)" }}/>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* My tasks */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3 }}>Assigned to me</div>
                <div style={{ flex: 1 }}/>
                <span className="mono" style={{ color: "var(--text-4)" }}>{myTasks.length} open</span>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--bg-2)" }}>
                {myTasks.map((t, i) => (
                  <button key={t._id} onClick={() => onOpenTask(t)}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "0 14px", height: 36,
                      borderTop: i ? "1px solid var(--border)" : "none",
                      background: "transparent", textAlign: "left",
                    }}>
                    <PriorityBars level={t.priority}/>
                    <StatusDot status={t.status} size={12}/>
                    <span className="mono" style={{ color: "var(--text-3)", width: 58 }}>{t.key}</span>
                    <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    {t.due && <span className="mono" style={{ color: "var(--text-3)" }}>{t.due}</span>}
                    <Avatar user={lookupMember(t.assigned_to)} size={18}/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Activity */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>Activity</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", padding: 6 }}>
                {ACTIVITY.map(a => {
                  const actor = lookupMember(a.actor);
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", fontSize: 12.5, lineHeight: 1.4 }}>
                      <Avatar user={actor} size={18}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 500 }}>{actor.name.split(" ")[0]}</span>{" "}
                        <span style={{ color: "var(--text-3)" }}>{a.verb}</span>{" "}
                        <span className="mono" style={{ color: "var(--accent)" }}>{a.target}</span>
                        {a.to && <> <span style={{ color: "var(--text-3)" }}>→</span> <span>{a.to}</span></>}
                      </div>
                      <span className="mono" style={{ color: "var(--text-4)", flex: "0 0 auto" }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>This week</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", padding: 6 }}>
                {[
                  { day: "WED", date: "12", title: "Launch email sequence QA", time: "10:00" },
                  { day: "THU", date: "13", title: "Press release review", time: "14:30" },
                  { day: "FRI", date: "14", title: "Q4 launch go/no-go", time: "16:00" },
                ].map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
                    <div style={{
                      width: 36, textAlign: "center", padding: "4px 0",
                      background: "var(--bg-sub)", borderRadius: 5, border: "1px solid var(--border)",
                    }}>
                      <div className="mono" style={{ color: "var(--text-3)", fontSize: 9.5 }}>{e.day}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1 }}>{e.date}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5 }}>{e.title}</div>
                      <div className="mono" style={{ color: "var(--text-3)" }}>{e.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Variant 2: Focus — single-column "what matters right now"
const DashboardFocus = ({ Header, onOpenTask, onProject }) => {
  const mine = TASKS.filter(t => t.assigned_to === ME._id);
  const inProg = mine.filter(t => t.status === "in_progress");
  const next = mine.filter(t => t.status === "todo");
  return (
    <div>
      <Header/>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 28px" }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 6 }}>FOCUS MODE</div>
        <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.025, margin: "0 0 6px" }}>
          You have {inProg.length + next.length} things to do today.
        </h1>
        <p style={{ color: "var(--text-3)", margin: "0 0 40px", fontSize: 14 }}>
          Everything else is filtered out. Press <span className="kbd">⌘K</span> to jump, or <span className="kbd">C</span> to add.
        </p>

        {/* In Progress (single, pinned) */}
        {inProg[0] && (
          <div style={{
            padding: 20, border: "1px solid var(--accent)",
            borderRadius: "var(--radius-lg)", background: "var(--accent-wash)",
            marginBottom: 28,
          }}>
            <div className="mono" style={{ color: "var(--accent)", marginBottom: 8 }}>NOW · IN PROGRESS</div>
            <button onClick={() => onOpenTask(inProg[0])} style={{ textAlign: "left", width: "100%" }}>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{inProg[0].title}</div>
              <div className="mono" style={{ color: "var(--text-3)" }}>
                {inProg[0].key} · due {inProg[0].due}
              </div>
            </button>
          </div>
        )}

        <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12 }}>Up next · {next.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
          {next.map((t, i) => (
            <button key={t._id} onClick={() => onOpenTask(t)}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "0 16px", height: 44,
                borderTop: i ? "1px solid var(--border)" : "none",
                textAlign: "left",
              }}>
              <PriorityBars level={t.priority}/>
              <StatusDot status={t.status} size={14}/>
              <span style={{ flex: 1, fontSize: 13.5 }}>{t.title}</span>
              <span className="mono" style={{ color: "var(--text-3)" }}>{t.due || "—"}</span>
            </button>
          ))}
          {next.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Inbox zero. Well done.</div>
          )}
        </div>

        <div style={{ marginTop: 40, padding: 16, border: "1px dashed var(--border)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 12, color: "var(--text-3)", fontSize: 12.5 }}>
          <I.sparkle size={14} style={{ color: "var(--accent)" }}/>
          <span>All {WORKSPACES[0].projectCount} projects are on track. Next review: Friday.</span>
          <div style={{ flex: 1 }}/>
          <button style={{ color: "var(--accent)" }}>View digest →</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
