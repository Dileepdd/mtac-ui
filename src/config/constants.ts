export interface ProjectColor { bg: string; fg: string; }

export const PROJECT_COLORS: Record<string, ProjectColor> = {
  indigo:  { bg: "#eef2ff", fg: "#4f46e5" },
  violet:  { bg: "#f3e8ff", fg: "#7c3aed" },
  emerald: { bg: "#d1fae5", fg: "#059669" },
  amber:   { bg: "#fef3c7", fg: "#b45309" },
  rose:    { bg: "#ffe4e6", fg: "#be123c" },
  cyan:    { bg: "#cffafe", fg: "#0891b2" },
};

export const STATUS_LABELS = {
  todo:        "Todo",
  in_progress: "In Progress",
  done:        "Done",
} as const;
