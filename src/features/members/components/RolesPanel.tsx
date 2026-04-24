import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { updateRolePermissionsApi, type RoleItem } from "@/api/role";
import { Tag } from "@/components/shared/Tag";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";

// Hardcoded permission catalogue — mirrors the backend PermissionModel seeder
// TODO backend: expose GET /permissions endpoint so this can be dynamic
const PERMISSION_GROUPS = [
  { group: "Workspace", items: [
    { key: "VIEW_WORKSPACE",   label: "View workspace details"  },
    { key: "UPDATE_WORKSPACE", label: "Update workspace settings" },
    { key: "DELETE_WORKSPACE", label: "Delete workspace"         },
  ]},
  { group: "Members", items: [
    { key: "VIEW_MEMBERS",       label: "List all members"          },
    { key: "ADD_MEMBER",         label: "Invite new members"        },
    { key: "REMOVE_MEMBER",      label: "Remove members"            },
    { key: "UPDATE_MEMBER_ROLE", label: "Change a member's role"    },
  ]},
  { group: "Roles", items: [
    { key: "ASSIGN_ROLE", label: "Assign role when adding members" },
    { key: "CHANGE_ROLE", label: "Modify role permissions"         },
  ]},
  { group: "Projects", items: [
    { key: "CREATE_PROJECT", label: "Create projects"   },
    { key: "VIEW_PROJECT",   label: "View projects"     },
    { key: "UPDATE_PROJECT", label: "Update projects"   },
    { key: "DELETE_PROJECT", label: "Delete projects"   },
  ]},
  { group: "Tasks", items: [
    { key: "CREATE_TASK", label: "Create tasks"          },
    { key: "VIEW_TASK",   label: "View task details"     },
    { key: "UPDATE_TASK", label: "Update tasks"          },
    { key: "DELETE_TASK", label: "Delete tasks"          },
    { key: "ASSIGN_TASK", label: "Assign tasks to members" },
  ]},
];

interface RolesPanelProps {
  roles: RoleItem[];
  onRolesChange: (updated: RoleItem) => void;
}

export function RolesPanel({ roles, onRolesChange }: RolesPanelProps) {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState(roles[0]?._id ?? "");
  const [saving, setSaving]         = useState(false);

  const role     = roles.find((r) => r._id === selectedId);
  const isSystem = role?.all_permissions ?? false;

  // Local permission state — only saved when user clicks "Save permissions"
  const [localPerms, setLocalPerms] = useState<Set<string>>(
    new Set(role?.permissions.map((p) => p.name) ?? [])
  );
  const [isDirty, setIsDirty] = useState(false);

  // Reset local perms when switching roles
  useEffect(() => {
    setLocalPerms(new Set(role?.permissions.map((p) => p.name) ?? []));
    setIsDirty(false);
  }, [selectedId]);

  function togglePerm(permKey: string) {
    if (isSystem) return;
    setLocalPerms((prev) => {
      const next = new Set(prev);
      next.has(permKey) ? next.delete(permKey) : next.add(permKey);
      return next;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    if (!role || isSystem || !workspace) return;
    setSaving(true);
    try {
      const updated = await updateRolePermissionsApi(workspace._id, role._id, [...localPerms]);
      onRolesChange(updated);
      queryClient.invalidateQueries({ queryKey: ["roles", workspace._id] });
      setIsDirty(false);
      toast.success("Permissions saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (!role) return null;

  return (
    <div style={{ padding: "16px 28px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
      {/* Role list */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", fontSize: 10.5 }}>Roles</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => toast.info("Custom roles coming soon.", { description: "Requires POST /workspace/:id/role endpoint." })}
            style={{ color: "var(--text-3)", width: 20, height: 20, borderRadius: 4, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {I.plus({ size: 12, stroke: 2 })}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {roles.map((r) => (
            <button
              key={r._id}
              onClick={() => {
                if (isDirty && !confirm("Discard unsaved permission changes?")) return;
                setSelectedId(r._id);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px",
                background: selectedId === r._id ? "var(--bg-hover)" : "transparent",
                border: `1px solid ${selectedId === r._id ? "var(--border-strong)" : "transparent"}`,
                borderRadius: 6, textAlign: "left", cursor: "pointer",
              }}
            >
              {I.shield({ size: 13, style: { color: r.all_permissions ? "var(--accent)" : "var(--text-3)", flexShrink: 0 } })}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div>
                <div className="mono" style={{ color: "var(--text-4)", fontSize: 10 }}>
                  {r.all_permissions ? "all permissions" : `${r.permissions.length} perms`}
                </div>
              </div>
              {r.all_permissions && <Tag>SYSTEM</Tag>}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions panel */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          {I.shield({ size: 15 })}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{role.name} role</div>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>
              PATCH /workspace/:id/role/{role._id}/permissions
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {!isSystem && (
            <Btn
              variant="primary"
              size="sm"
              disabled={saving || !isDirty}
              onClick={handleSave}
            >
              {saving ? "Saving…" : isDirty ? "Save permissions" : "Saved"}
            </Btn>
          )}
          {isSystem && (
            <Btn variant="ghost" size="sm" disabled>Read-only</Btn>
          )}
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
          {PERMISSION_GROUPS.map((g) => (
            <div key={g.group}>
              <div className="mono" style={{ color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.3, fontSize: 10.5 }}>
                {g.group}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {g.items.map((p) => {
                  const on = isSystem || localPerms.has(p.key);
                  return (
                    <label
                      key={p.key}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        padding: "6px 8px", borderRadius: 4,
                        cursor: isSystem ? "not-allowed" : "pointer",
                        opacity: isSystem ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!isSystem) e.currentTarget.style.background = "var(--bg-sub)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      onClick={() => togglePerm(p.key)}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, marginTop: 1, flexShrink: 0,
                        background: on ? "var(--accent)" : "var(--bg-2)",
                        border: `1px solid ${on ? "var(--accent)" : "var(--border-strong)"}`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "#fff",
                      }}>
                        {on && I.check({ size: 10, stroke: 3 })}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="mono" style={{ fontSize: 10.5, color: on ? "var(--text)" : "var(--text-3)", fontWeight: 500 }}>
                          {p.key}
                        </div>
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
}
