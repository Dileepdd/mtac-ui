import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {
  updateProfileApi, updatePasswordApi,
  updatePreferencesApi, updateAvatarApi, deleteAccountApi,
  listTokensApi, createTokenApi, revokeTokenApi,
  type NotificationPrefs, type TokenItem,
} from "@/api/user";
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

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const navigate = useNavigate();
  const { user, setAuth, token, clearAuth } = useAuthStore();
  const [name, setName]         = useState(user?.name ?? "");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { toast.error("Image must be under 500 KB."); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await updateAvatarApi(base64);
        toast.success("Avatar updated.");
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Failed to upload avatar.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteAccountApi();
      clearAuth();
      navigate("/login");
      toast.success("Account deleted.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete account.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>PATCH /user/profile</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.01, margin: "4px 0 4px" }}>Profile</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 4px" }}>Your info across MTAC.</p>

      <SettingRow title="Avatar" desc="Upload a photo or use your initials.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={user} size={48} />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
          <Btn variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>Upload</Btn>
        </div>
      </SettingRow>

      <SettingRow title="Full name" desc="Min 3, max 50 characters.">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
        />
      </SettingRow>

      <SettingRow title="Email" desc="Used for sign-in and notifications.">
        <Input value={user?.email ?? ""} disabled rightEl={<Tag>VERIFIED</Tag>} />
      </SettingRow>

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

      <div style={{ marginTop: 48, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 14 }}>
        {I.flag?.({ size: 16, style: { color: "#dc2626", flexShrink: 0 } })}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#991b1b" }}>Danger zone</div>
          <div style={{ fontSize: 12, color: "#b91c1c" }}>Delete your account. This cannot be undone.</div>
        </div>
        <Btn variant="danger" size="sm" disabled={deleting} onClick={handleDeleteAccount}>
          {deleting ? "Deleting…" : "Delete account"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Password section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving]   = useState(false);

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
          <Input type="password" placeholder="••••••••" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </Field>
        <Field label="New password" hint="8+ chars, upper, lower, number, symbol.">
          <Input type="password" placeholder="••••••••" value={next} onChange={(e) => setNext(e.target.value)} required />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
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

// ─── Notifications section ────────────────────────────────────────────────────

const PREF_ITEMS: { k: keyof NotificationPrefs; title: string; desc: string }[] = [
  { k: "assigned", title: "Task assigned to me",  desc: "When someone assigns you a task." },
  { k: "mentions", title: "Mentions",              desc: "When someone @mentions you in a comment." },
  { k: "comments", title: "Comments on my tasks",  desc: "Replies on tasks you created or are assigned to." },
  { k: "status",   title: "Status changes",        desc: "When a task you follow changes status." },
  { k: "weekly",   title: "Weekly digest",         desc: "A Monday summary of what's open and due." },
];

function NotifsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    assigned: true, mentions: true, comments: true, status: false, weekly: true,
  });

  async function togglePref(k: keyof NotificationPrefs) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    try {
      await updatePreferencesApi({ [k]: next[k] });
    } catch {
      setPrefs(prefs);
      toast.error("Failed to save preference.");
    }
  }

  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>PATCH /user/preferences</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 4px" }}>Notifications</h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 4px" }}>Changes save immediately.</p>
      {PREF_ITEMS.map(({ k, title, desc }) => (
        <SettingRow key={k} title={title} desc={desc}>
          <Toggle on={prefs[k]} onChange={() => togglePref(k)} />
        </SettingRow>
      ))}
    </div>
  );
}

// ─── Keyboard shortcuts section ───────────────────────────────────────────────

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

// ─── API tokens section ───────────────────────────────────────────────────────

function ApiSection() {
  const qc = useQueryClient();
  const [newName, setNewName]     = useState("");
  const [creating, setCreating]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [revealed, setRevealed]   = useState<string | null>(null);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["user-tokens"],
    queryFn: listTokensApi,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const result = await createTokenApi(newName.trim());
      qc.invalidateQueries({ queryKey: ["user-tokens"] });
      setNewName("");
      setShowForm(false);
      setRevealed(result.token);
      toast.success("Token created — copy it now.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create token.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(t: TokenItem) {
    if (!window.confirm(`Revoke "${t.name}"? Any apps using it will stop working.`)) return;
    try {
      await revokeTokenApi(t._id);
      qc.invalidateQueries({ queryKey: ["user-tokens"] });
      toast.success("Token revoked.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to revoke token.");
    }
  }

  function timeSince(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>GET · POST · DELETE /user/tokens</div>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "4px 0 20px" }}>API tokens</h2>

      {revealed && (
        <div style={{ marginBottom: 16, padding: 14, background: "var(--accent-wash)", border: "1px solid var(--accent)", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Copy your token now — it won't be shown again.</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <code style={{ flex: 1, fontSize: 11, fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>{revealed}</code>
            <Btn
              variant="secondary"
              size="sm"
              icon={I.copy({ size: 13 })}
              onClick={() => { navigator.clipboard.writeText(revealed); toast.success("Copied!"); }}
            />
          </div>
          <button
            onClick={() => setRevealed(null)}
            style={{ marginTop: 8, fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}
          >
            I've copied it — dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ height: 40, background: "var(--bg-sub)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }} />
      ) : tokens.length === 0 && !showForm ? (
        <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius)", color: "var(--text-3)", fontSize: 13 }}>
          No tokens yet.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)" }}>
          {tokens.map((t, i) => (
            <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}>
              {I.link({ size: 14, style: { color: "var(--text-3)" } })}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                  {t.prefix} · {t.last_used_at ? `last used ${timeSince(t.last_used_at)}` : `created ${timeSince(t.created_at)}`}
                </span>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => handleRevoke(t)}>Revoke</Btn>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Input
            placeholder="Token name (e.g. CI pipeline)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <Btn variant="primary" size="sm" type="submit" disabled={creating || !newName.trim()}>
            {creating ? "Creating…" : "Create"}
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewName(""); }}>Cancel</Btn>
        </form>
      ) : (
        <div style={{ marginTop: 12 }}>
          <Btn
            variant="secondary"
            size="sm"
            icon={I.plus({ size: 13, stroke: 2 })}
            onClick={() => setShowForm(true)}
          >
            Generate new token
          </Btn>
        </div>
      )}
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
