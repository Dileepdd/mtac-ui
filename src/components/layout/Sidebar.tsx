import { useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useCmdkStore } from "@/stores/cmdkStore";
import { apiClient } from "@/api/client";
import { I } from "@/icons";
import { Avatar } from "@/components/shared/Avatar";
import { ProjectGlyph } from "@/components/shared/ProjectGlyph";
import { Popover, MenuItem } from "@/components/shared/Popover";
import type { Project } from "@/types/domain";
import type { RefObject, ReactNode } from "react";

// ─── NavItem ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon:      ReactNode;
  label:     string;
  count?:    number;
  hotkey?:   string;
  active:    boolean;
  onClick:   () => void;
}

function NavItem({ icon, label, count, hotkey, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", height: 26, padding: "0 8px",
        borderRadius: 5,
        background: active ? "var(--bg-hover)" : "transparent",
        color: active ? "var(--text)" : "var(--text-2)",
        fontSize: 12.5, fontWeight: active ? 500 : 400,
        textAlign: "left",
      }}
    >
      <span style={{ color: active ? "var(--accent)" : "var(--text-3)", display: "inline-flex" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && (
        <span style={{ fontSize: 10.5, color: "var(--text-4)", fontFamily: "var(--font-mono-ui)" }}>{count}</span>
      )}
      {hotkey && <span className="kbd" style={{ opacity: 0.7 }}>{hotkey}</span>}
    </button>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  open:     boolean;
  setOpen:  (v: boolean) => void;
  children: ReactNode;
  onAdd?:   () => void;
}

function SectionHeader({ open, setOpen, children, onAdd }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 22, padding: "0 8px", marginTop: 10, gap: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 10.5, fontWeight: 500, letterSpacing: 0.3,
          color: "var(--text-3)", textTransform: "uppercase",
          fontFamily: "var(--font-mono-ui)",
        }}
      >
        <I.chevRight
          size={10} stroke={2}
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.1s" }}
        />
        {children}
      </button>
      <div style={{ flex: 1 }} />
      {onAdd && (
        <button
          onClick={onAdd}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          style={{
            width: 18, height: 18, borderRadius: 4,
            color: "var(--text-3)", display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <I.plus size={12} stroke={2} />
        </button>
      )}
    </div>
  );
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────

function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        height: 26, padding: "0 8px", borderRadius: 5,
        color: "var(--text-2)", fontSize: 12.5, textAlign: "left",
      }}
    >
      <ProjectGlyph project={project} size={16} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {project.name}
      </span>
      {project.taskCount != null && (
        <span style={{ fontSize: 10.5, color: "var(--text-4)", fontFamily: "var(--font-mono-ui)" }}>
          {project.taskCount}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { slug }   = useParams<{ slug: string }>();

  const user          = useAuthStore((s) => s.user);
  const clearAuth     = useAuthStore((s) => s.clearAuth);
  const workspace     = useWorkspaceStore((s) => s.workspace);
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);
  const openCmdK      = useCmdkStore((s) => s.openCmdK);

  const wsBtnRef = useRef<HTMLButtonElement>(null);
  const [wsOpen, setWsOpen]           = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [favsOpen, setFavsOpen]       = useState(true);

  const base = `/w/${slug}`;

  const isActive = (path: string) =>
    path === base ? location.pathname === base : location.pathname.startsWith(path);

  // Projects — wired directly here; Phase 12 will lift into a shared query hook
  const { data: projectsData } = useQuery<{ data: Project[] }>({
    queryKey: ["projects", workspace?._id],
    queryFn: () =>
      apiClient.get(`/workspace/${workspace!._id}/project?limit=50`).then((r) => r.data),
    enabled: !!workspace?._id,
    staleTime: 30_000,
  });
  const projects: Project[] = projectsData?.data ?? [];

  function handleSignOut() {
    clearWorkspace();
    clearAuth();
    navigate("/login");
  }

  return (
    <aside style={{
      width: 232, flex: "0 0 232px",
      borderRight: "1px solid var(--border)",
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      overflow: "hidden",
    }}>

      {/* Workspace switcher */}
      <div style={{ padding: 8, paddingBottom: 0 }}>
        <button
          ref={wsBtnRef}
          onClick={() => setWsOpen(true)}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            height: 34, padding: "0 8px", borderRadius: 6,
          }}
        >
          <span style={{ color: "var(--accent)", display: "inline-flex" }}>
            <I.logo size={18} />
          </span>
          <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600 }}>
            {workspace?.name ?? "…"}
          </span>
          <I.chevDown size={12} stroke={2} style={{ color: "var(--text-3)" }} />
        </button>

        <Popover
          anchor={wsBtnRef as RefObject<HTMLElement | null>}
          open={wsOpen}
          onClose={() => setWsOpen(false)}
          width={228}
        >
          <div style={{ padding: "4px 8px 6px", fontSize: 10.5, fontFamily: "var(--font-mono-ui)", color: "var(--text-3)", textTransform: "uppercase" }}>
            Workspaces
          </div>
          <MenuItem icon={<I.layers size={13} />} selected>
            {workspace?.name ?? "Current workspace"}
          </MenuItem>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <MenuItem icon={<I.plus size={13} />} onClick={() => { setWsOpen(false); navigate("/workspaces", { state: { create: true } }); }}>
            Create workspace
          </MenuItem>
          <MenuItem icon={<I.settings size={13} />} onClick={() => { setWsOpen(false); navigate(`${base}/settings`); }}>
            Workspace settings
          </MenuItem>
          <MenuItem icon={<I.logout size={13} />} onClick={handleSignOut}>
            Sign out
          </MenuItem>
        </Popover>
      </div>

      {/* Search / Cmd K */}
      <div style={{ padding: 8 }}>
        <button
          onClick={openCmdK}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-sub)"; }}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            height: 28, padding: "0 8px", borderRadius: 6,
            background: "var(--bg-sub)", color: "var(--text-3)", fontSize: 12.5,
            border: "1px solid var(--border)",
          }}
        >
          <I.search size={13} />
          <span style={{ flex: 1, textAlign: "left" }}>Search or jump to…</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>

      {/* Main nav */}
      <nav style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <NavItem
          icon={<I.inbox size={14} />} label="Inbox"
          active={false}
          onClick={() => toast.info("Inbox coming soon.")}
          count={0}
        />
        <NavItem
          icon={<I.home size={14} />} label="Home"
          active={isActive(base)}
          onClick={() => navigate(base)}
        />
        <NavItem
          icon={<I.activity size={14} />} label="My tasks"
          active={false}
          onClick={() => toast.info("My Tasks coming soon.", { description: "Will show tasks assigned to you across all projects." })}
        />
      </nav>

      {/* Favorites */}
      <SectionHeader open={favsOpen} setOpen={setFavsOpen}>Favorites</SectionHeader>
      {favsOpen && (
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          {projects.slice(0, 2).map((p) => (
            <ProjectRow key={p._id} project={p} onClick={() => navigate(`${base}/p/${p._id}`)} />
          ))}
        </div>
      )}

      {/* Projects */}
      <SectionHeader
        open={projectsOpen}
        setOpen={setProjectsOpen}
        onAdd={() => navigate(`${base}/projects`)}
      >
        Projects
      </SectionHeader>
      {projectsOpen && (
        <div style={{
          padding: "0 8px", display: "flex", flexDirection: "column", gap: 1,
          overflow: "auto", flex: 1,
        }}>
          {projects.map((p) => (
            <ProjectRow key={p._id} project={p} onClick={() => navigate(`${base}/p/${p._id}`)} />
          ))}
          {projects.length === 0 && (
            <div style={{ padding: "6px 8px", fontSize: 11.5, color: "var(--text-4)" }}>
              No projects yet
            </div>
          )}
        </div>
      )}

      {/* Bottom */}
      <div style={{
        marginTop: "auto", borderTop: "1px solid var(--border)",
        padding: 8, display: "flex", flexDirection: "column", gap: 1,
      }}>
        <NavItem
          icon={<I.users size={14} />} label="Members"
          active={isActive(`${base}/members`)}
          onClick={() => navigate(`${base}/members`)}
        />
        <NavItem
          icon={<I.settings size={14} />} label="Settings"
          active={isActive(`${base}/account`)}
          onClick={() => navigate(`${base}/account`)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginTop: 2 }}>
          <Avatar user={user} size={20} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div className="mono" style={{ color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
