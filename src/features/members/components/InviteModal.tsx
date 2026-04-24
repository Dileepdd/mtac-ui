import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import type { RoleItem } from "@/api/role";
import { useWorkspaceStore } from "@/stores/workspaceStore";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  roles: RoleItem[];
}

export function InviteModal({ open, onClose, roles }: InviteModalProps) {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const [email, setEmail]       = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(
    roles.find((r) => !r.all_permissions && r.name.toLowerCase() === "member")?._id ?? roles[roles.length - 1]?._id ?? ""
  );
  const [message, setMessage]   = useState("");

  const nonSystemRoles = roles.filter((r) => !r.all_permissions);

  function handleClose() {
    setEmail(""); setMessage("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} width={520}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        {/*
          TODO backend: add invite-by-email flow.
          Current endpoint POST /workspace-member/:id/create requires an existing userId,
          not an email. Need: send email → user accepts → membership created.
        */}
        <div className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
          POST /workspace-member/:id/create
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
          Invite people to {workspace?.name ?? "workspace"}
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email address" hint="Enter the email of an existing MTAC user">
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

        <Field label="Personal message (optional)">
          <textarea
            placeholder="Come help us ship Q4…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%", minHeight: 72, padding: 10,
              border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--bg-2)", color: "var(--text)",
              fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </Field>
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, background: "var(--bg-sub)" }}>
        <Btn
          variant="ghost"
          size="sm"
          icon={I.link({ size: 13 })}
          onClick={() => toast.info("Invite link coming soon.", { description: "Requires invite-by-email backend flow." })}
        >
          Copy invite link
        </Btn>
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" onClick={handleClose}>Cancel</Btn>
        <Btn
          variant="primary"
          size="sm"
          disabled={!email.trim()}
          onClick={() => {
            // TODO backend: implement invite-by-email flow
            // Current /workspace-member/:id/create requires userId not email
            toast.info("Email invites coming soon.", { description: "Backend needs invite-by-email endpoint." });
            handleClose();
          }}
        >
          Send invite
        </Btn>
      </div>
    </Modal>
  );
}
