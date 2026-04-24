import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { updateWorkspaceApi, deleteWorkspaceApi } from "@/api/workspace";
import { applySettingsHierarchy, type Font, type Density } from "@/config/colors";
import { Btn } from "@/components/shared/Btn";
import { Input } from "@/components/shared/Input";
import { Field } from "@/components/shared/Field";
import { Modal } from "@/components/shared/Modal";
import { I } from "@/icons";

const ACCENT_SWATCHES = [
  "#4f46e5", "#7c3aed", "#059669", "#b45309",
  "#be123c", "#0891b2", "#c2410c", "#0d9488",
];

const FONTS: { value: Font; label: string }[] = [
  { value: "geist",  label: "Geist (default)" },
  { value: "plex",   label: "IBM Plex" },
  { value: "system", label: "System" },
];

const DENSITIES: { value: Density; label: string }[] = [
  { value: "compact",     label: "Compact" },
  { value: "comfortable", label: "Comfortable (default)" },
  { value: "spacious",    label: "Spacious" },
];

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

export default function WorkspaceSettingsPage() {
  const navigate    = useNavigate();
  const { slug }    = useParams<{ slug: string }>();
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const user        = useAuthStore((s) => s.user);

  const [wsName, setWsName]       = useState(workspace?.name ?? "");
  const [accent, setAccent]       = useState("#4f46e5");
  const [font, setFont]           = useState<Font>("geist");
  const [density, setDensity]     = useState<Density>("comfortable");
  const [saving, setSaving]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Apply appearance changes immediately to the DOM
  function handleAccentChange(color: string) {
    setAccent(color);
    applySettingsHierarchy({ color_theme: { accent: color }, font, density }, user?.preferences);
  }
  function handleFontChange(f: Font) {
    setFont(f);
    applySettingsHierarchy({ color_theme: { accent }, font: f, density }, user?.preferences);
  }
  function handleDensityChange(d: Density) {
    setDensity(d);
    applySettingsHierarchy({ color_theme: { accent }, font, density: d }, user?.preferences);
  }

  async function handleSaveName() {
    if (!workspace || !wsName.trim()) return;
    setSaving(true);
    try {
      await updateWorkspaceApi(workspace._id, { name: wsName.trim() });
      toast.success("Workspace name saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save name.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAppearance() {
    if (!workspace) return;
    setSaving(true);
    try {
      await updateWorkspaceApi(workspace._id, {
        settings: { accent, font, density },
      });
      toast.success("Appearance saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save appearance.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (!workspace || deleteConfirm !== workspace.name) return;
    setSaving(true);
    try {
      await deleteWorkspaceApi(workspace._id);
      toast.success("Workspace deleted.");
      navigate("/workspaces", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete workspace.");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
      setDeleteConfirm("");
    }
  }

  return (
    <div>
      <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid var(--border)" }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, fontSize: 11 }}>
          WORKSPACE / SETTINGS
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>
          Workspace Settings
        </h1>
      </div>

      <div style={{ padding: "28px 36px", maxWidth: 680 }}>

        {/* ── General ── */}
        <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 12, fontSize: 10.5 }}>
          General
        </div>

        {/* Workspace name */}
        <SettingRow title="Workspace name" desc="Visible to all members.">
          <div style={{ display: "flex", gap: 6 }}>
            <Input value={wsName} onChange={(e) => setWsName(e.target.value)} placeholder="Workspace name" />
            <Btn variant="secondary" size="sm" disabled={saving} onClick={handleSaveName}>Save</Btn>
          </div>
        </SettingRow>

        {/* Slug — read-only */}
        <SettingRow title="Slug" desc="Used in URLs. Cannot be changed.">
          <Input value={workspace?.slug ?? workspace?._id ?? ""} readOnly style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)" }} />
        </SettingRow>

        {/* ── Appearance ── */}
        <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", margin: "28px 0 12px", fontSize: 10.5 }}>
          Appearance
        </div>

        <SettingRow title="Accent color" desc="Applied across the workspace for all members.">
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleAccentChange(c)}
                  style={{
                    width: 22, height: 22, borderRadius: 5, background: c,
                    border: accent === c ? "2px solid var(--text)" : "2px solid transparent",
                    cursor: "pointer",
                    outline: accent === c ? "2px solid var(--bg)" : "none",
                    outlineOffset: -3,
                  }}
                />
              ))}
            </div>
            <Input
              value={accent}
              onChange={(e) => handleAccentChange(e.target.value)}
              placeholder="#4f46e5"
              style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
            />
          </div>
        </SettingRow>

        <SettingRow title="Font" desc="Interface font for this workspace.">
          <select
            value={font}
            onChange={(e) => handleFontChange(e.target.value as Font)}
            style={{
              width: "100%", padding: "6px 10px",
              border: "1px solid var(--border)", borderRadius: 5,
              background: "var(--bg-2)", color: "var(--text)",
              fontSize: 12.5, cursor: "pointer",
            }}
          >
            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </SettingRow>

        <SettingRow title="Density" desc="Row height and spacing.">
          <select
            value={density}
            onChange={(e) => handleDensityChange(e.target.value as Density)}
            style={{
              width: "100%", padding: "6px 10px",
              border: "1px solid var(--border)", borderRadius: 5,
              background: "var(--bg-2)", color: "var(--text)",
              fontSize: 12.5, cursor: "pointer",
            }}
          >
            {DENSITIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </SettingRow>

        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <Btn variant="primary" size="sm" disabled={saving} onClick={handleSaveAppearance}>
            {saving ? "Saving…" : "Save appearance"}
          </Btn>
        </div>

        {/* ── Localization ── */}
        <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", margin: "28px 0 12px", fontSize: 10.5 }}>
          Localization
        </div>

        <SettingRow title="Timezone" desc="Used for due dates and digests.">
          <select
            style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 5, background: "var(--bg-2)", color: "var(--text-3)", fontSize: 12.5, cursor: "not-allowed" }}
            disabled
          >
            <option>UTC (coming soon)</option>
          </select>
        </SettingRow>

        <SettingRow title="Date format">
          <select
            style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 5, background: "var(--bg-2)", color: "var(--text-3)", fontSize: 12.5, cursor: "not-allowed" }}
            disabled
          >
            <option>MM/DD/YYYY (coming soon)</option>
          </select>
        </SettingRow>

        {/* ── Danger zone ── */}
        <div style={{ marginTop: 48, padding: 16, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 14 }}>
          {I.flag?.({ size: 16, style: { color: "#dc2626", flexShrink: 0 } })}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#991b1b" }}>Danger zone</div>
            <div style={{ fontSize: 12, color: "#b91c1c" }}>
              Delete this workspace. All projects and tasks will be permanently removed.
            </div>
          </div>
          <Btn variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete workspace
          </Btn>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirm(""); }} width={420}>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Delete workspace</div>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 16px" }}>
            This will permanently delete <strong style={{ color: "var(--text)" }}>{workspace?.name}</strong> and all its projects and tasks. This cannot be undone.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
              Type <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{workspace?.name}</span> to confirm
            </div>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={workspace?.name}
              autoFocus
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" size="sm" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>Cancel</Btn>
            <Btn
              variant="danger"
              size="sm"
              disabled={deleteConfirm !== workspace?.name || saving}
              onClick={handleDeleteWorkspace}
            >
              {saving ? "Deleting…" : "Delete workspace"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
