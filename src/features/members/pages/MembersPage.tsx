import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { listMembersApi, updateMemberRoleApi, removeMemberApi, type MemberItem } from "@/api/member";
import { listRolesApi, type RoleItem } from "@/api/role";
import { Avatar } from "@/components/shared/Avatar";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { RoleDropdown } from "../components/RoleDropdown";
import { RolesPanel } from "../components/RolesPanel";
import { InviteModal } from "../components/InviteModal";
import { I } from "@/icons";

type Tab = "members" | "roles";

const COLS = "1.6fr 1.2fr 0.8fr 1fr 44px";

function idToHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h % 360;
}

function joinedDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function MembersPage() {
  const workspace   = useWorkspaceStore((s) => s.workspace);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [tab, setTab]           = useState<Tab>("members");
  const [query, setQuery]       = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  // ── Members ──
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members", workspace?._id],
    queryFn: () => listMembersApi(workspace!._id),
    enabled: !!workspace,
  });

  // ── Roles ──
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", workspace?._id],
    queryFn: () => listRolesApi(workspace!._id),
    enabled: !!workspace,
  });

  const [localRoles, setLocalRoles] = useState<RoleItem[] | null>(null);
  const roles: RoleItem[] = localRoles ?? rolesData ?? [];

  // Combine self + subordinate members into one list
  const rawSelf    = membersData?.data?.self;
  const rawMembers = membersData?.data?.members ?? [];
  const allMembers: MemberItem[] = rawSelf ? [rawSelf, ...rawMembers] : rawMembers;
  const filtered   = allMembers.filter((m) =>
    m.user_id.name.toLowerCase().includes(query.toLowerCase()) ||
    m.user_id.email.toLowerCase().includes(query.toLowerCase())
  );

  async function handleRoleChange(member: MemberItem, newRole: RoleItem) {
    if (!workspace) return;
    try {
      await updateMemberRoleApi(workspace._id, member.user_id._id, newRole._id);
      queryClient.invalidateQueries({ queryKey: ["members", workspace._id] });
      toast.success(`${member.user_id.name}'s role updated to ${newRole.name}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update role.");
    }
  }

  async function handleRemove(member: MemberItem) {
    if (!workspace) return;
    if (!confirm(`Remove ${member.user_id.name} from this workspace?`)) return;
    try {
      await removeMemberApi(workspace._id, member.user_id._id);
      queryClient.invalidateQueries({ queryKey: ["members", workspace._id] });
      toast.success(`${member.user_id.name} removed.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to remove member.");
    }
  }

  return (
    <div>
      {/* ── Sticky header ── */}
      <div style={{
        padding: "20px 28px 0", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 5,
      }}>
        <div className="mono" style={{ color: "var(--text-3)", marginBottom: 4, fontSize: 11 }}>
          WORKSPACE / MEMBERS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.02, margin: 0 }}>Team</h1>
          <span className="mono" style={{ color: "var(--text-3)" }}>
            {allMembers.length} members · {roles.length} roles
          </span>
          <div style={{ flex: 1 }} />
          <Btn
            variant="primary"
            size="sm"
            icon={I.plus({ size: 13, stroke: 2 })}
            onClick={() => setInviteOpen(true)}
          >
            Invite people
          </Btn>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {([["members", "Members", allMembers.length], ["roles", "Roles & permissions", roles.length]] as const).map(([k, label, n]) => (
            <button
              key={k}
              onClick={() => setTab(k as Tab)}
              style={{
                padding: "8px 14px", fontSize: 12.5, fontWeight: 500,
                color: tab === k ? "var(--text)" : "var(--text-3)",
                borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, background: "none", cursor: "pointer",
              }}
            >
              {label}
              <span className="mono" style={{ color: "var(--text-4)", marginLeft: 4 }}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Members tab ── */}
      {tab === "members" && (
        <div style={{ padding: "16px 28px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 260 }}>
              <Input
                icon={I.search({ size: 13 })}
                placeholder="Search by name or email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery("")}
              />
            </div>
            <Btn variant="ghost" size="sm" icon={I.filter({ size: 13 })}>Filter by role</Btn>
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg-2)", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: COLS,
              padding: "8px 14px", borderBottom: "1px solid var(--border)",
              fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", textTransform: "uppercase",
            }}>
              <span>Member</span><span>Email</span><span>Role</span><span>Joined</span><span />
            </div>

            {membersLoading ? (
              [0, 1, 2].map((i) => (
                <div key={i} style={{ height: 48, borderTop: "1px solid var(--border)", background: "var(--bg-sub)" }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                {query ? `No members match "${query}"` : "No members found."}
              </div>
            ) : filtered.map((m) => {
              const isMe     = m.user_id._id === currentUser?._id;
              const memberRole = roles.find((r) => r._id === m.role_id._id);
              const isSystem = memberRole?.all_permissions ?? false;

              return (
                <div
                  key={m._id}
                  style={{
                    display: "grid", gridTemplateColumns: COLS, alignItems: "center",
                    padding: "0 14px", height: 48, borderTop: "1px solid var(--border)",
                  }}
                >
                  {/* Member */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar
                      user={{ _id: m.user_id._id, name: m.user_id.name, email: m.user_id.email, hue: idToHue(m.user_id._id) }}
                      size={28}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.user_id.name}</div>
                      {isMe && <span className="mono" style={{ color: "var(--text-4)", fontSize: 10 }}>YOU</span>}
                    </div>
                  </div>

                  {/* Email */}
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.user_id.email}
                  </span>

                  {/* Role dropdown */}
                  {memberRole ? (
                    <RoleDropdown
                      role={memberRole}
                      roles={roles}
                      disabled={isSystem || isMe}
                      onChange={(newRole) => handleRoleChange(m, newRole)}
                    />
                  ) : (
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5 }}>{m.role_id.name}</span>
                  )}

                  {/* Joined */}
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 11.5 }}>
                    {joinedDate(m.created_at)}
                  </span>

                  {/* Actions */}
                  <button
                    disabled={isMe || isSystem}
                    onClick={() => handleRemove(m)}
                    title="Remove member"
                    style={{
                      width: 28, height: 28, borderRadius: 4,
                      color: "var(--text-3)", background: "none", border: "none",
                      cursor: isMe || isSystem ? "not-allowed" : "pointer",
                      opacity: isMe || isSystem ? 0.3 : 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                    onMouseEnter={(e) => { if (!isMe && !isSystem) e.currentTarget.style.color = "#dc2626"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; }}
                  >
                    {I.trash({ size: 13 })}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Roles tab ── */}
      {tab === "roles" && (
        rolesLoading
          ? <div style={{ padding: 28, color: "var(--text-3)", fontSize: 13 }}>Loading roles…</div>
          : <RolesPanel
              roles={roles}
              onRolesChange={(updated) => {
                setLocalRoles((prev) =>
                  (prev ?? rolesData ?? []).map((r) => r._id === updated._id ? updated : r)
                );
              }}
            />
      )}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} roles={roles} />
    </div>
  );
}
