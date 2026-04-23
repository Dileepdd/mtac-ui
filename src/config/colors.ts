// Runtime theme application — mirrors the CSS vars in index.css.
// Call applySettingsHierarchy() whenever the active workspace or user prefs change.

export type Font    = "geist" | "plex" | "system";
export type Density = "compact" | "comfortable" | "spacious";
export type Theme   = "light" | "dark" | "system";

export interface WorkspaceSettings {
  color_theme?: { accent?: string };
  font?:        Font;
  density?:     Density;
  timezone?:    string;
  date_format?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  language?:    string;
}

export interface UserPreferences {
  theme?:       Theme;
  font?:        Font;
  density?:     Density;
  timezone?:    string;
  date_format?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  language?:    string;
}

// Settings hierarchy (highest → lowest priority):
//   1. Workspace settings  — accent color, font, density
//   2. User preferences    — theme, font, density
//   3. Global defaults     — index.css :root values
export function applySettingsHierarchy(
  workspaceSettings?: WorkspaceSettings,
  userPreferences?: UserPreferences,
) {
  const root = document.documentElement;

  // Accent color — workspace overrides global default (#4F46E5)
  const accent = workspaceSettings?.color_theme?.accent;
  if (accent) {
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-2", accent);
    // Update wash to 8% opacity of the accent
    root.style.setProperty("--accent-wash", hexToRgba(accent, 0.08));
  } else {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-2");
    root.style.removeProperty("--accent-wash");
  }

  // Font — workspace wins, then user pref, then default (geist)
  const font = workspaceSettings?.font ?? userPreferences?.font ?? "geist";
  root.setAttribute("data-font", font);

  // Density — workspace wins, then user pref, then default (comfortable)
  const density = workspaceSettings?.density ?? userPreferences?.density ?? "comfortable";
  root.setAttribute("data-density", density);

  // Theme — user preference only (light/dark/system)
  applyTheme(userPreferences?.theme ?? "light");
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

// Call when leaving a workspace — falls back to user prefs + global defaults.
export function resetWorkspaceOverrides(userPreferences?: UserPreferences) {
  applySettingsHierarchy(undefined, userPreferences);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
