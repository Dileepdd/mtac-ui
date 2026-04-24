// Accepts hex color directly — the backend stores hex values (#4f46e5 etc.)
// Falls back to a safe default if color or name are missing.

interface ProjectGlyphProps {
  project: { name?: string; color?: string };
  size?: number;
}

export function ProjectGlyph({ project, size = 18 }: ProjectGlyphProps) {
  const color   = project?.color || "#4f46e5";
  const initial = (project?.name || "?").charAt(0).toUpperCase();

  return (
    <span style={{
      width: size, height: size,
      borderRadius: Math.max(3, size * 0.22),
      background: color,
      color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(8, size * 0.48), fontWeight: 600, letterSpacing: 0,
      fontFamily: "var(--font-mono-ui)",
      flex: "0 0 auto",
    }}>
      {initial}
    </span>
  );
}
