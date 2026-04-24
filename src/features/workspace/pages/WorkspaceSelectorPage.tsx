import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { listWorkspacesApi, createWorkspaceApi, type WorkspaceListItem } from "@/api/workspace";
import type { Workspace, Role } from "@/types/domain";
import { I } from "@/icons";
import { Btn } from "@/components/shared/Btn";
import { Input } from "@/components/shared/Input";

// Maps the real backend workspace list item to the store's Workspace shape
function toWorkspace(item: WorkspaceListItem): Workspace {
  return {
    _id:        item._id,
    name:       item.name,
    slug:       item.slug || item._id, // fallback for workspaces created before slug was added
    created_by: "",
    settings:   undefined,
  };
}

// Maps the real backend role object to the store's Role shape
function toRole(item: WorkspaceListItem): Role {
  return {
    _id:          item.role._id,
    name:         item.role.name,
    level:        item.role.level,
    permissions:  item.role.permissions,
    workspace_id: item._id,
    is_system:    item.role.is_system,
  };
}

const WS_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e",
  "#f97316","#eab308","#22c55e","#14b8a6","#3b82f6",
];

function wsColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return WS_COLORS[h % WS_COLORS.length];
}

function WorkspaceCard({ item, onClick }: { item: WorkspaceListItem; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const color = wsColor(item.name);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        border: `1px solid ${hov ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 8,
        background: hov ? "var(--bg-hover)" : "var(--bg-2)",
        textAlign: "left", width: "100%", cursor: "pointer",
        transition: "background 0.08s, border-color 0.08s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 16, fontWeight: 600,
      }}>
        {item.name.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{item.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span style={{
            fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)",
            background: "var(--bg-sub)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "1px 5px",
          }}>
            {item.role.name}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            {item.memberCount} {item.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      <span style={{ color: "var(--text-3)", display: "inline-flex" }}>
        {I.chevRight({ size: 14 })}
      </span>
    </button>
  );
}

export default function WorkspaceSelectorPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const wantsCreate  = (location.state as { create?: boolean } | null)?.create === true;
  const user         = useAuthStore((s) => s.user);
  const clearAuth    = useAuthStore((s) => s.clearAuth);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  // const workspace    = useWorkspaceStore((s) => s.workspace);

  const [workspaces, setWorkspaces]       = useState<WorkspaceListItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [creating, setCreating]           = useState(wantsCreate);
  const [newName, setNewName]             = useState("");
  const [createError, setCreateError]     = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  // Clear workspace when entering workspace selector
  useEffect(() => {
    clearWorkspace();
  }, [clearWorkspace]);

  useEffect(() => {
    let cancelled = false;
    listWorkspacesApi()
      .then((res) => {
        if (cancelled) return;
        const list = res.data;
        setWorkspaces(list);
        if (list.length === 1 && !wantsCreate) {
          const ws   = toWorkspace(list[0]);
          const role = toRole(list[0]);
          setWorkspace(ws, role);
          navigate(`/w/${ws.slug}`, { replace: true });
        }
      })
      .catch(() => { if (!cancelled) setError("Failed to load workspaces. Please refresh."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function enterWorkspace(item: WorkspaceListItem) {
    const ws   = toWorkspace(item);
    const role = toRole(item);
    setWorkspace(ws, role);
    navigate(`/w/${ws.slug}`);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreateError(""); setCreateLoading(true);
    try {
      const created = await createWorkspaceApi(name);
      const item: WorkspaceListItem = {
        _id:         created._id,
        name:        created.name,
        slug:        created.slug,
        created_at:  new Date().toISOString(),
        memberCount: 1,
        role: { _id: "", name: "admin", level: 1, is_system: true, permissions: [] },
      };
      enterWorkspace(item);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? "Failed to create workspace.");
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--accent)", display: "inline-flex" }}>{I.logo({ size: 20 })}</span>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.02 }}>MTAC</span>
          </div>
          {workspaces.length > 0 ? (
            <Btn variant="ghost" size="sm" icon={I.chevLeft({ size: 13 })} onClick={() => navigate(-1)}>Back</Btn>
          ) : (
            <Btn variant="ghost" size="sm" icon={I.logout({ size: 13 })} onClick={handleLogout}>Sign out</Btn>
          )}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>Select a workspace</h1>
        {user && (
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 24px" }}>
            Signed in as <span style={{ color: "var(--text)", fontWeight: 500 }}>{user.email}</span>
          </p>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ height: 64, borderRadius: 8, background: "var(--bg-sub)", border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ fontSize: 13, color: "#dc2626", padding: "12px 0" }}>{error}</div>
        ) : workspaces.length === 0 ? (
          <div style={{ padding: "28px 20px", borderRadius: 8, textAlign: "center", border: "1px dashed var(--border)", background: "var(--bg-sub)", marginBottom: 8 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🏢</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>No workspaces yet</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Create your first workspace below to get started.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {workspaces.map((item) => (
              <WorkspaceCard key={item._id} item={item} onClick={() => enterWorkspace(item)} />
            ))}
          </div>
        )}

        <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />

        {/* Create workspace */}
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--text-3)", fontSize: 13, cursor: "pointer", background: "transparent" }}
          >
            {I.plus({ size: 14, stroke: 2 })} Create a new workspace
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ border: "1px solid var(--accent)", borderRadius: 8, background: "var(--bg-2)", padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>New workspace name</div>
            <Input 
              ref={inputRef} 
              placeholder="e.g. Acme Corp" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              required 
              rightEl={
                newName && (
                  <button
                    type="button"
                    onClick={() => { setNewName(""); inputRef.current?.focus(); }}
                    style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                    title="Clear"
                  >
                    {I.x({ size: 14 })}
                  </button>
                )
              }
            />
            {createError && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{createError}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" size="sm" onClick={() => { setCreating(false); setNewName(""); setCreateError(""); }}>Cancel</Btn>
              <Btn variant="primary" size="sm" type="submit" disabled={createLoading || !newName.trim()}>
                {createLoading ? "Creating…" : "Create"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
