import type { CSSProperties, ReactNode } from "react";

interface TagColor { bg: string; fg: string; }

interface TagProps {
  children: ReactNode;
  color?:   TagColor;
  style?:   CSSProperties;
}

export function Tag({ children, color, style }: TagProps) {
  const c = color ?? { bg: "var(--bg-sub)", fg: "var(--text-2)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      height: 18, padding: "0 6px",
      background: c.bg, color: c.fg,
      borderRadius: 4, fontSize: 10.5, fontFamily: "var(--font-mono-ui)",
      fontWeight: 500, letterSpacing: 0, border: "1px solid var(--border)",
      ...style,
    }}>
      {children}
    </span>
  );
}
