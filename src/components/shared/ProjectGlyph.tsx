import { PROJECT_COLORS } from "@/config/constants";

interface ProjectGlyphProps {
  project: { name: string; key: string; color: string };
  size?: number;
}

export function ProjectGlyph({ project, size = 18 }: ProjectGlyphProps) {
  const c = PROJECT_COLORS[project.color] ?? PROJECT_COLORS.indigo;
  return (
    <span style={{
      width: size, height: size,
      borderRadius: Math.max(3, size * 0.22),
      background: c.bg, color: c.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(8, size * 0.48), fontWeight: 600, letterSpacing: 0,
      fontFamily: "var(--font-mono-ui)",
      flex: "0 0 auto",
    }}>
      {project.key[0]}
    </span>
  );
}
