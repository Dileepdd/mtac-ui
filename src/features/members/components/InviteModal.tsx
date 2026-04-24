import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import type { RoleItem } from "@/api/role";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { inviteMemberApi } from "@/api/member";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  roles: RoleItem[];
}

export function InviteModal({ open, onClose, roles }: InviteModalProps) {
  const workspace = useWorkspaceStore((s) => s.workspace);

  const defaultRoleId = () =>
    roles.find((r) => !r.all_permissions && r.name.toLowerCase() === "member")?._id ??
    roles[roles.length - 1]?._id ??
    "";

  const [email, setEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId);
  const [loading, setLoading] = useState(false);

  const nonSystemRoles = roles.filter((r) => !r.all_permissions);

  function handleClose() {
    setEmail("");
    setSelectedRoleId(defaultRoleId());
    onClose();
  }

  async function handleSend() {
    if (!email.trim() || !workspace) return;
    setLoading(true);
    try {
      await inviteMemberApi(workspace._id, email.trim(), selectedRoleId || undefined);
      toast.success(`Invite sent to ${email.trim()}`);
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!email.trim() || !workspace) {
      toast.error("Enter an email address first");
      return;
    }
    setLoading(true);
    try {
      const { inviteLink } = await inviteMemberApi(workspace._id, email.trim(), selectedRoleId || undefined);
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} width={520}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          Invite people to {workspace?.name ?? "workspace"}
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email address">
          <Input
            icon={I.mail({ size: 13 })}
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Role">
          <div style={{ display: "flex", gap: 6 }}>
            {nonSystemRoles.map((r) => (
              <button
                key={r._id}
                onClick={() => setSelectedRoleId(r._id)}
                style={{
                  flex: 1, padding: "10px 12px", textAlign: "left",
                  background: selectedRoleId === r._id ? "var(--accent-wash)" : "var(--bg-sub)",
                  border: `1px solid ${selectedRoleId === r._id ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 6, cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 500, color: selectedRoleId === r._id ? "var(--accent)" : "var(--text)" }}>
                  {r.name}
                </div>
                <div className="mono" style={{ color: "var(--text-3)", marginTop: 2, fontSize: 10.5 }}>
                  {r.permissions.length} permissions
                </div>
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, background: "var(--bg-sub)" }}>
        <Btn
          variant="ghost"
          size="sm"
          icon={I.link({ size: 13 })}
          disabled={loading || !email.trim()}
          onClick={handleCopyLink}
        >
          Copy invite link
        </Btn>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          size="sm"
          disabled={loading || !email.trim()}
          onClick={handleSend}
        >
          {loading ? "Sending…" : "Send invite"}
        </Btn>
      </div>
    </Modal>
  );
}
