import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { PROJECT_COLORS, deriveKey } from "./ProjectCard";
import { createProjectApi } from "@/api/project";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useQueryClient } from "@tanstack/react-query";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const queryClient = useQueryClient();

  const [name, setName]         = useState("");
  const [key, setKey]           = useState("");
  const [color, setColor]       = useState(PROJECT_COLORS[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Auto-derive key from name
  useEffect(() => { setKey(deriveKey(name)); }, [name]);

  function handleClose() {
    setName(""); setKey(""); setColor(PROJECT_COLORS[0]); setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspace) return;
    setError(""); setLoading(true);
    try {
      await createProjectApi(workspace._id, { name: name.trim(), key: key.trim() || undefined, color });
      queryClient.invalidateQueries({ queryKey: ["projects", workspace._id] });
      handleClose();
      onCreated();
    } catch (err: any) {
      const detail = err?.response?.data?.errors?.[0]?.message;
      setError(detail ?? err?.response?.data?.message ?? "Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} width={440}>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>New project</div>
        <div className="mono" style={{ color: "var(--text-3)", fontSize: 11, marginBottom: 20 }}>
          POST /workspace/:id/project
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Project name">
            <Input
              placeholder="e.g. Q4 Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              onClear={() => setName("")}
            />
          </Field>

          <Field label={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Key</span>
              <span style={{ color: "var(--text-4)", fontWeight: 400 }}>auto</span>
            </div>
          }>
            <Input
              placeholder="KEY"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 6))}
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </Field>

          {/* Color picker */}
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 6, fontWeight: 500 }}>Color</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: 5,
                    background: c,
                    border: color === c ? `2px solid var(--text)` : "2px solid transparent",
                    cursor: "pointer",
                    outline: color === c ? "2px solid var(--bg)" : "none",
                    outlineOffset: -3,
                  }}
                />
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: "#dc2626" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
            <Btn variant="ghost" size="sm" onClick={handleClose}>Cancel</Btn>
            <Btn variant="primary" size="sm" type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating…" : "Create project"}
            </Btn>
          </div>
        </form>
      </div>
    </Modal>
  );
}
