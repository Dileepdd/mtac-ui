import type { ReactNode } from "react";
import { I } from "@/icons";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    // grid-cols-1 on mobile (right panel hidden) → grid-cols-2 on md+ (desktop split)
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Left: form — full-width on mobile, half on desktop */}
      <div style={{ display: "flex", flexDirection: "column", padding: "32px 32px" }}
           className="md:px-12">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}>
            {I.logo({ size: 20 })}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.02 }}>MTAC</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 340 }}>{children}</div>
        </div>

        <div className="mono" style={{ color: "var(--text-4)", display: "flex", gap: 14, fontSize: 11 }}>
          <span>© 2026 MTAC</span>
          <span>·</span>
          <a style={{ cursor: "pointer" }}>Privacy</a>
          <a style={{ cursor: "pointer" }}>Terms</a>
          <a style={{ cursor: "pointer" }}>Docs</a>
        </div>
      </div>

      {/* Right: quiet panel — hidden on narrow viewports via Tailwind */}
      <div
        className="hidden md:flex"
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--bg-sub)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
          opacity: 0.6,
          pointerEvents: "none",
        }} />

        {/* Tagline */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 80 }}>
          <div style={{
            fontSize: 11,
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 14,
          }}>
            Built for speed
          </div>
          <h2 style={{
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: -0.02,
            margin: 0,
            maxWidth: 420,
          }}>
            A keyboard-first project tool<br />
            <span style={{ color: "var(--text-3)" }}>for teams that ship.</span>
          </h2>
        </div>

        {/* Stats */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 32,
          fontSize: 11.5,
          color: "var(--text-3)",
        }}>
          <div>
            <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>⌘K</div>
            <div style={{ marginTop: 4 }}>Global command palette</div>
          </div>
          <div>
            <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>~12ms</div>
            <div style={{ marginTop: 4 }}>Average interaction latency</div>
          </div>
          <div>
            <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>42</div>
            <div style={{ marginTop: 4 }}>Keyboard shortcuts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
