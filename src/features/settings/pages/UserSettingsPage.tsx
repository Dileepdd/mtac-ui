import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { updateProfileApi, updatePasswordApi } from "@/api/user";
import { Avatar } from "@/components/shared/Avatar";
import { Btn } from "@/components/shared/Btn";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Tag } from "@/components/shared/Tag";
import { Toggle } from "@/components/shared/Toggle";
import { I } from "@/icons";

// ─── Shared layout ────────────────────────────────────────────────────────────

function SettingRow({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 300px", gap: 20,
      padding: "16px 0", borderTop: "1px solid var(--border)",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, maxWidth: 340 }}>{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName]     = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function handleSave() {
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Name must be at least 3 characters.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfileApi(name.trim());
      if (user && token) setAuth({ ...user, name: updated.name }, token);
      setSaved(true);
      toast.success("Profile saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>PATCH /user/profile</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.01, margin: "4px 0 4px" }}>Profile</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 4px" }}>Your info across MTAC.</p>

      {/* Avatar */}
      {/* TODO backend: add avatar upload endpoint (POST /user/avatar) */}
      <SettingRow title="Avatar" desc="Auto-generated from your initials.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={user} size={48} />
          <Btn
            variant="secondary"
            size="sm"
            onClick={() => toast.info("Avatar upload coming soon.", { description: "Requires POST /user/avatar endpoint." })}
          >
            Upload
          </Btn>
        </div>
      </SettingRow>

      {/* Name */}
      <SettingRow title="Full name" desc="Min 3, max 50 characters.">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
        />
      </SettingRow>

      {/* Email */}
      <SettingRow title="Email" desc="Used for sign-in and notifications.">
        <Input
          value={user?.email ?? ""}
          disabled
          rightEl={<Tag>VERIFIED</Tag>}
        />
      </SettingRow>

      {/* User ID */}
      <SettingRow title="User ID" desc="Reference this in the API.">
        <div style={{ display: "flex", gap: 6 }}>
          <Input
            value={user?._id ?? ""}
            readOnly
            style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}
          />
          <Btn
            variant="secondary"
            size="sm"
            icon={I.copy({ size: 13 })}
            onClick={() => { navigator.clipboard.writeText(user?._id ?? ""); toast.success("User ID copied."); }}
          />
        </div>
      </SettingRow>

      <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <Btn variant="primary" size="sm" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Btn>
        {saved && (
          <span className="mono" style={{ color: "var(--status-done)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5 }}>
            {I.check({ size: 12 })} Saved
          </span>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 48, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 14 }}>
        {I.flag?.({ size: 16, style: { color: "#dc2626", flexShrink: 0 } })}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#991b1b" }}>Danger zone</div>
          <div style={{ fontSize: 12, color: "#b91c1c" }}>Delete your account. This cannot be undone.</div>
        </div>
        {/* TODO backend: add DELETE /user/account endpoint */}
        <Btn
          variant="danger"
          size="sm"
          onClick={() => toast.info("Account deletion coming soon.", { description: "Requires DELETE /user/account endpoint." })}
        >
          Delete account
        </Btn>
      </div>
    </div>
  );
}

function PasswordSection() {
  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [saving, setSaving]     = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (next !== confirm) { toast.error("New passwords don't match."); return; }
    setSaving(true);
    try {
      await updatePasswordApi(current, next);
      toast.success("Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message ?? err?.response?.data?.message ?? "Failed to update password.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>PATCH /user/password</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 4px" }}>Password</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 20px" }}>Choose a strong password and don't reuse it.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360 }}>
        <Field label="Current password">
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={current} 
            onChange={(e) => setCurrent(e.target.value)} 
            required 
            rightEl={
              current && (
                <button
                  type="button"
                  onClick={() => setCurrent("")}
                  style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                  title="Clear"
                >
                  {I.x({ size: 14 })}
                </button>
              )
            }
          />
        </Field>
        <Field label="New password" hint="8+ chars, upper, lower, number, symbol.">
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={next} 
            onChange={(e) => setNext(e.target.value)} 
            required 
            rightEl={
              next && (
                <button
                  type="button"
                  onClick={() => setNext("")}
                  style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                  title="Clear"
                >
                  {I.x({ size: 14 })}
                </button>
              )
            }
          />
        </Field>
        <Field label="Confirm new password">
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            required 
            rightEl={
              confirm && (
                <button
                  type="button"
                  onClick={() => setConfirm("")}
                  style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                  title="Clear"
                >
                  {I.x({ size: 14 })}
                </button>
              )
            }
          />
        </Field>
        <div style={{ marginTop: 4 }}>
          <Btn variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </Btn>
        </div>
      </form>
    </div>
  );
}

function NotifsSection() {
  // TODO backend: user model needs notification_prefs field to persist these
  const [prefs, setPrefs] = useState({
    assigned: true, mentions: true, comments: true, status: false, weekly: true,
  });

  const items: [keyof typeof prefs, string, string][] = [
    ["assigned", "Task assigned to me",    "When someone assigns you a task."],
    ["mentions", "Mentions",               "When someone @mentions you in a comment."],
    ["comments", "Comments on my tasks",   "Replies on tasks you created or are assigned to."],
    ["status",   "Status changes",         "When a task you follow changes status."],
    ["weekly",   "Weekly digest",          "A Monday summary of what's open and due."],
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 4px" }}>Notifications</h2>
      {/* TODO backend: persist notification prefs — PATCH /user/preferences */}
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 4px" }}>
        Preferences saved locally for now.
      </p>
      {items.map(([k, title, desc]) => (
        <SettingRow key={k} title={title} desc={desc}>
          <Toggle on={prefs[k]} onChange={() => setPrefs((p) => ({ ...p, [k]: !p[k] }))} />
        </SettingRow>
      ))}
    </div>
  );
}

function KeyboardSection() {
  const shortcuts: [string, [string, string[]][]][] = [
    ["Global", [
      ["Open command palette", ["⌘", "K"]],
      ["Create new task",      ["C"]],
      ["Toggle theme",         ["⇧", "D"]],
      ["Show shortcuts",       ["?"]],
    ]],
    ["Navigation", [
      ["Go to Home",     ["G", "H"]],
      ["Go to My tasks", ["G", "T"]],
      ["Go to Members",  ["G", "M"]],
      ["Go to Settings", ["G", "S"]],
    ]],
    ["Task", [
      ["Edit task",      ["E"]],
      ["Change status",  ["S"]],
      ["Assign to…",     ["A"]],
      ["Set priority",   ["P"]],
    ]],
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 4px" }}>Keyboard shortcuts</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 4px" }}>MTAC is keyboard-first. Here's the full set.</p>
      {shortcuts.map(([group, items]) => (
        <div key={group} style={{ marginTop: 20 }}>
          <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8, fontSize: 10.5 }}>
            {group}
          </div>
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
}

function ApiSection() {
  // TODO backend: add token management endpoints
  // GET /user/tokens, POST /user/tokens, DELETE /user/tokens/:id
  const tokens = [
    { name: "Local dev",   used: "2m ago",  prefix: "mtac_live_a7f3…" },
    { name: "CI pipeline", used: "1d ago",  prefix: "mtac_live_b8e1…" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 4px" }}>API tokens</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 20px" }}>
        Authenticate against the MTAC API.
        {/* TODO backend: token management requires GET/POST/DELETE /user/tokens endpoints */}
      </p>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)" }}>
        {tokens.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}>
            {I.link({ size: 14, style: { color: "var(--text-3)" } })}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
              <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>{t.prefix} · last used {t.used}</span>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => toast.info("Token revocation coming soon.")}>Revoke</Btn>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn
          variant="secondary"
          size="sm"
          icon={I.plus({ size: 13, stroke: 2 })}
          onClick={() => toast.info("Token generation coming soon.", { description: "Requires POST /user/tokens endpoint." })}
        >
          Generate new token
        </Btn>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Section = "profile" | "security" | "notifs" | "keyboard" | "api";

const NAV: { k: Section; label: string; icon: () => React.ReactNode }[] = [
  { k: "profile",  label: "Profile",       icon: () => I.home({ size: 13 }) },
  { k: "security", label: "Password",      icon: () => I.lock({ size: 13 }) },
  { k: "notifs",   label: "Notifications", icon: () => I.bell({ size: 13 }) },
  { k: "keyboard", label: "Keyboard",      icon: () => I.cmd?.({ size: 13 }) },
  { k: "api",      label: "API tokens",    icon: () => I.link({ size: 13 }) },
];

export default function UserSettingsPage() {
  const [section, setSection] = useState<Section>("profile");

  return (
    <div>
      <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid var(--border)" }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, fontSize: 11 }}>ACCOUNT</div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", maxWidth: 1100 }}>
        {/* Left nav */}
        <nav style={{
          borderRight: "1px solid var(--border)",
          padding: "18px 12px",
          display: "flex", flexDirection: "column", gap: 1,
          minHeight: "calc(100vh - 120px)",
        }}>
          {NAV.map((s) => (
            <button
              key={s.k}
              onClick={() => setSection(s.k)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                height: 28, padding: "0 10px", borderRadius: 5,
                background: section === s.k ? "var(--bg-hover)" : "transparent",
                color: section === s.k ? "var(--text)" : "var(--text-2)",
                fontSize: 12.5, fontWeight: section === s.k ? 500 : 400,
                textAlign: "left", border: "none", cursor: "pointer",
              }}
            >
              <span style={{ color: section === s.k ? "var(--accent)" : "var(--text-3)" }}>
                {s.icon()}
              </span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ padding: "28px 36px", maxWidth: 640 }}>
          {section === "profile"  && <ProfileSection />}
          {section === "security" && <PasswordSection />}
          {section === "notifs"   && <NotifsSection />}
          {section === "keyboard" && <KeyboardSection />}
          {section === "api"      && <ApiSection />}
        </div>
      </div>
    </div>
  );
}
