// Members & Roles screen — list + invite modal + role permissions panel.

const MembersScreen = () => {
  const [tab, setTab] = useState(window.__mtac_initial?.tab || "members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("r_member");
  const [members, setMembers] = useState(MEMBERS);
  const [roles, setRoles] = useState(ROLES);

  return (
    <div>
      <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4 }}>WORKSPACE / MEMBERS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>Team</h1>
          <span className="mono" style={{ color: "var(--text-3)" }}>{members.length} members · {roles.length} roles</span>
          <div style={{ flex: 1 }}/>
          <Btn variant="primary" icon={<I.plus size={13} stroke={2}/>} onClick={() => setInviteOpen(true)}>Invite people</Btn>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {[["members", "Members", members.length], ["roles", "Roles & permissions", roles.length]].map(([k, label, n]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "8px 14px", fontSize: 12.5, fontWeight: 500,
              color: tab === k ? "var(--text)" : "var(--text-3)",
              borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
            }}>
              {label} <span className="mono" style={{ color: "var(--text-4)", marginLeft: 4 }}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "members" ? (
        <div style={{ padding: "16px 28px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 260 }}>
              <Input icon={<I.search size={13}/>} placeholder="Search by name or email…"/>
            </div>
            <Btn variant="ghost" icon={<I.filter size={13}/>}>Filter by role</Btn>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 0.8fr 1fr 44px", padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase" }}>
              <span>Member</span><span>Email</span><span>Role</span><span>Joined</span><span/>
            </div>
            {members.map(m => {
              const role = lookupRole(m.roleId);
              return (
                <div key={m._id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 0.8fr 1fr 44px", alignItems: "center", padding: "0 14px", height: 48, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar user={m} size={28}/>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      {m._id === ME._id && <span className="mono" style={{ color: "var(--text-4)" }}>YOU</span>}
                    </div>
                  </div>
                  <span className="mono" style={{ color: "var(--text-3)" }}>{m.email}</span>
                  <RoleDropdown role={role} roles={roles} onChange={(r) => setMembers(ms => ms.map(x => x._id === m._id ? { ...x, roleId: r._id } : x))} disabled={role.system}/>
                  <span className="mono" style={{ color: "var(--text-3)" }}>Mar 2025</span>
                  <button style={{ width: 28, height: 28, borderRadius: 4, color: "var(--text-3)" }}><I.more size={14}/></button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <RolesPanel roles={roles} setRoles={setRoles} selectedRole={selectedRole} setSelectedRole={setSelectedRole}/>
      )}

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} width={520}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div className="mono" style={{ color: "var(--text-3)" }}>POST /workspace-member/:id/add</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>Invite people to Acme Product</div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Email addresses" hint="Press Enter to add multiple">
            <Input icon={<I.mail size={13}/>} placeholder="name@company.com"/>
          </Field>
          <Field label="Role">
            <div style={{ display: "flex", gap: 6 }}>
              {roles.filter(r => !r.system).map(r => (
                <button key={r._id} onClick={() => setSelectedRole(r._id)} style={{
                  flex: 1, padding: "10px 12px", textAlign: "left",
                  background: selectedRole === r._id ? "var(--accent-wash)" : "var(--bg-sub)",
                  border: `1px solid ${selectedRole === r._id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: selectedRole === r._id ? "var(--accent)" : "var(--text)" }}>{r.name}</div>
                  <div className="mono" style={{ color: "var(--text-3)", marginTop: 2 }}>{r.perms.length} permissions</div>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Personal message (optional)">
            <textarea placeholder="Come help us ship Q4…" style={{
              width: "100%", minHeight: 72, padding: 10, border: "1px solid var(--border)",
              borderRadius: 6, background: "var(--bg-2)", color: "var(--text)", fontSize: 13,
              fontFamily: "inherit", resize: "vertical", outline: "none",
            }}/>
          </Field>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, background: "var(--bg-sub)" }}>
          <Btn variant="ghost" icon={<I.link size={13}/>}>Copy invite link</Btn>
          <div style={{ flex: 1 }}/>
          <Btn variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => setInviteOpen(false)}>Send invite</Btn>
        </div>
      </Modal>
    </div>
  );
};

const RoleDropdown = ({ role, roles, onChange, disabled }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button ref={ref} onClick={() => !disabled && setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 24, padding: "0 8px", borderRadius: 4,
          background: "var(--bg-sub)", border: "1px solid var(--border)",
          fontSize: 11.5, fontWeight: 500, color: "var(--text)", width: "fit-content",
          cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1,
        }}>
        <I.shield size={11} style={{ color: "var(--text-3)" }}/>
        {role.name}
        {!disabled && <I.chevDown size={10} stroke={2} style={{ color: "var(--text-3)" }}/>}
      </button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)}>
        {roles.map(r => (
          <MenuItem key={r._id} icon={<I.shield size={13}/>} selected={r._id === role._id} onClick={() => { onChange(r); setOpen(false); }}>
            <div>{r.name}</div>
            <div className="mono" style={{ color: "var(--text-4)", fontSize: 10 }}>{r.perms.length} perms</div>
          </MenuItem>
        ))}
      </Popover>
    </>
  );
};

const RolesPanel = ({ roles, setRoles, selectedRole, setSelectedRole }) => {
  const role = roles.find(r => r._id === selectedRole);
  const toggle = (perm) => {
    setRoles(rs => rs.map(r => r._id !== role._id ? r : {
      ...r,
      perms: r.perms.includes(perm) ? r.perms.filter(p => p !== perm) : [...r.perms, perm]
    }));
  };
  return (
    <div style={{ padding: "16px 28px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
      {/* Role list */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase" }}>Roles</span>
          <div style={{ flex: 1 }}/>
          <button style={{ color: "var(--text-3)", width: 20, height: 20, borderRadius: 4 }}><I.plus size={12} stroke={2}/></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {roles.map(r => (
            <button key={r._id} onClick={() => setSelectedRole(r._id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              background: selectedRole === r._id ? "var(--bg-hover)" : "transparent",
              border: "1px solid " + (selectedRole === r._id ? "var(--border-strong)" : "transparent"),
              borderRadius: 6, textAlign: "left",
            }}>
              <I.shield size={13} style={{ color: r.system ? "var(--accent)" : "var(--text-3)" }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div>
                <div className="mono" style={{ color: "var(--text-4)" }}>{r.count} members · {r.perms.length} perms</div>
              </div>
              {r.system && <Tag>SYSTEM</Tag>}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <I.shield size={15}/>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{role.name} role</div>
            <div className="mono" style={{ color: "var(--text-3)" }}>PATCH /workspace/:id/role/{role._id}/permissions</div>
          </div>
          <div style={{ flex: 1 }}/>
          <Btn variant="ghost" disabled={role.system}>{role.system ? "Read-only" : "Duplicate"}</Btn>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
          {PERMISSIONS.map(g => (
            <div key={g.group}>
              <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.3 }}>{g.group}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {g.items.map(p => {
                  const on = role.perms.includes(p.key);
                  return (
                    <label key={p.key} style={{
                      display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px",
                      borderRadius: 4, cursor: role.system ? "not-allowed" : "pointer",
                      opacity: role.system ? 0.7 : 1,
                    }}
                      onMouseEnter={e => !role.system && (e.currentTarget.style.background = "var(--bg-sub)")}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, marginTop: 1,
                        background: on ? "var(--accent)" : "var(--bg-2)",
                        border: "1px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", flex: "0 0 auto",
                      }}>
                        {on && <I.check size={10} stroke={3}/>}
                      </div>
                      <input type="checkbox" checked={on} onChange={() => !role.system && toggle(p.key)} style={{ display: "none" }}/>
                      <div style={{ minWidth: 0 }}>
                        <div className="mono" style={{ fontSize: 10.5, color: on ? "var(--text)" : "var(--text-3)", fontWeight: 500 }}>{p.key}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{p.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MembersScreen });
