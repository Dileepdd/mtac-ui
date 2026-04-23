// Profile & Settings screen.

const SettingsScreen = ({ setRoute }) => {
  const [section, setSection] = useState(window.__mtac_initial?.section || "profile");

  const sections = [
    { k: "profile",  label: "Profile",        icon: <I.home size={13}/> },
    { k: "security", label: "Password",       icon: <I.lock size={13}/> },
    { k: "notifs",   label: "Notifications",  icon: <I.bell size={13}/> },
    { k: "keyboard", label: "Keyboard",       icon: <I.cmd size={13}/> },
    { k: "api",      label: "API tokens",     icon: <I.link size={13}/> },
  ];

  return (
    <div>
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4 }}>ACCOUNT</div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 14px" }}>Settings</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, maxWidth: 1100 }}>
        <nav style={{ borderRight: "1px solid var(--border)", padding: "18px 12px", display: "flex", flexDirection: "column", gap: 1, minHeight: "calc(100vh - 120px)" }}>
          {sections.map(s => (
            <button key={s.k} onClick={() => setSection(s.k)} style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 28, padding: "0 10px", borderRadius: 5,
              background: section === s.k ? "var(--bg-hover)" : "transparent",
              color: section === s.k ? "var(--text)" : "var(--text-2)",
              fontSize: 12.5, fontWeight: section === s.k ? 500 : 400, textAlign: "left",
            }}>
              <span style={{ color: section === s.k ? "var(--accent)" : "var(--text-3)" }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "28px 36px", maxWidth: 640 }}>
          {section === "profile" && <ProfileSection/>}
          {section === "security" && <PasswordSection/>}
          {section === "notifs" && <NotifsSection/>}
          {section === "keyboard" && <KeyboardSection/>}
          {section === "api" && <ApiSection/>}
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ title, desc, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, maxWidth: 340 }}>{desc}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const ProfileSection = () => {
  const [name, setName] = useState(ME.name);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)" }}>PATCH /user/profile</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.01, margin: "4px 0 8px" }}>Profile</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>Your info across MTAC.</p>

      <SettingRow title="Avatar" desc="Auto-generated from your initials. PNG/JPG up to 2MB.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={ME} size={48}/>
          <Btn variant="secondary">Upload</Btn>
          <Btn variant="ghost">Remove</Btn>
        </div>
      </SettingRow>

      <SettingRow title="Full name" desc="Min 3, max 50 characters.">
        <Input value={name} onChange={e => { setName(e.target.value); setSaved(false); }}/>
      </SettingRow>

      <SettingRow title="Email" desc="Used for sign-in and notifications.">
        <Input value={ME.email} disabled rightEl={<Tag>VERIFIED</Tag>}/>
      </SettingRow>

      <SettingRow title="User ID" desc="Reference this in the API.">
        <div style={{ display: "flex", gap: 6 }}>
          <Input value="6723f0a1e2b4c5d8f9a0b123" readOnly style={{ fontFamily: "var(--font-mono)" }}/>
          <Btn variant="secondary" icon={<I.copy size={13}/>}/>
        </div>
      </SettingRow>

      <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <Btn variant="primary" onClick={() => setSaved(true)}>Save changes</Btn>
        {saved && <span className="mono" style={{ color: "var(--status-done)", display: "inline-flex", alignItems: "center", gap: 4 }}><I.check size={12}/> Saved</span>}
      </div>

      <div style={{ marginTop: 48, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 14 }}>
        <I.flag size={16} style={{ color: "#dc2626", flex: "0 0 auto" }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#991b1b" }}>Danger zone</div>
          <div style={{ fontSize: 12, color: "#b91c1c" }}>Delete your account. This cannot be undone.</div>
        </div>
        <Btn variant="danger">Delete account</Btn>
      </div>
    </div>
  );
};

const PasswordSection = () => (
  <div>
    <div className="mono" style={{ color: "var(--text-3)" }}>PATCH /user/password</div>
    <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 8px" }}>Password</h2>
    <p style={{ color: "var(--text-3)", fontSize: 13 }}>Choose a strong password and don't reuse it.</p>

    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14, maxWidth: 360 }}>
      <Field label="Current password"><Input type="password" placeholder="••••••••"/></Field>
      <Field label="New password" hint="8+ chars, with upper, lower, number, symbol."><Input type="password" placeholder="••••••••"/></Field>
      <Field label="Confirm new password"><Input type="password" placeholder="••••••••"/></Field>
      <div style={{ marginTop: 4 }}>
        <Btn variant="primary">Update password</Btn>
      </div>
    </div>
  </div>
);

const NotifsSection = () => {
  const [prefs, setPrefs] = useState({ assigned: true, mentions: true, comments: true, status: false, weekly: true });
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  const items = [
    ["assigned", "Task assigned to me", "When someone assigns you a task."],
    ["mentions", "Mentions", "When someone @mentions you in a comment."],
    ["comments", "Comments on my tasks", "Replies on tasks you created or are assigned to."],
    ["status", "Status changes", "When a task you follow changes status."],
    ["weekly", "Weekly digest", "A Monday summary of what's open and due."],
  ];
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 8px" }}>Notifications</h2>
      {items.map(([k, t, d]) => (
        <SettingRow key={k} title={t} desc={d}>
          <Toggle on={prefs[k]} onChange={() => toggle(k)}/>
        </SettingRow>
      ))}
    </div>
  );
};

const Toggle = ({ on, onChange }) => (
  <button onClick={onChange} style={{
    width: 32, height: 18, borderRadius: 10,
    background: on ? "var(--accent)" : "var(--border-strong)",
    position: "relative", transition: "background 0.12s",
  }}>
    <span style={{
      position: "absolute", top: 2, left: on ? 16 : 2,
      width: 14, height: 14, borderRadius: "50%",
      background: "#fff", transition: "left 0.12s",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    }}/>
  </button>
);

const KeyboardSection = () => {
  const shortcuts = [
    ["Global", [
      ["Open command palette", ["⌘", "K"]],
      ["Create new task", ["C"]],
      ["Toggle theme", ["⇧", "D"]],
      ["Show keyboard shortcuts", ["?"]],
    ]],
    ["Navigation", [
      ["Go to Home", ["G", "H"]],
      ["Go to My tasks", ["G", "T"]],
      ["Go to Members", ["G", "M"]],
      ["Go to Settings", ["G", "S"]],
    ]],
    ["Task", [
      ["Edit task", ["E"]],
      ["Change status", ["S"]],
      ["Assign to…", ["A"]],
      ["Set priority", ["P"]],
    ]],
  ];
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 8px" }}>Keyboard shortcuts</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>MTAC is keyboard-first. Here's the full set.</p>
      {shortcuts.map(([group, items]) => (
        <div key={group} style={{ marginTop: 20 }}>
          <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>{group}</div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)" }}>
            {items.map(([label, keys], i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", padding: "8px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {keys.map((k, j) => <span key={j} className="kbd">{k}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ApiSection = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 8px" }}>API tokens</h2>
    <p style={{ color: "var(--text-3)", fontSize: 13 }}>Authenticate against the MTAC API. Tokens are scoped to your user.</p>
    <div style={{ marginTop: 20, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)" }}>
      {[
        { name: "Local dev", used: "2m ago", prefix: "mtac_live_a7f3…" },
        { name: "CI pipeline", used: "1d ago", prefix: "mtac_live_b8e1…" },
      ].map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}>
          <I.link size={14} style={{ color: "var(--text-3)" }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
            <span className="mono" style={{ color: "var(--text-3)" }}>{t.prefix} · last used {t.used}</span>
          </div>
          <Btn variant="ghost">Revoke</Btn>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 12 }}>
      <Btn variant="secondary" icon={<I.plus size={13} stroke={2}/>}>Generate new token</Btn>
    </div>
  </div>
);

Object.assign(window, { SettingsScreen });
