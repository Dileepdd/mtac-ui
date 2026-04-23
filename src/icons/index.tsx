import type { CSSProperties, ReactNode } from "react";

interface IconProps {
  d?: string;
  s?: ReactNode;
  size?: number;
  stroke?: number | string;
  fill?: string;
  style?: CSSProperties;
}

const Icon = ({ d, s, size = 16, stroke = 1.5, fill = "none", style }: IconProps) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={style} aria-hidden="true"
  >
    {d && <path d={d} />}
    {s}
  </svg>
);

type IconFn = (props?: IconProps) => ReactNode;

export const I: Record<string, IconFn> = {
  logo: (p) => (
    <svg width={p?.size ?? 22} height={p?.size ?? 22} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3"  y="3"  width="8" height="8" rx="2" fill="currentColor" opacity="0.28" />
      <rect x="13" y="3"  width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="3"  y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  ),
  search:     (p) => <Icon {...p} s={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}/>,
  plus:       (p) => <Icon {...p} d="M12 5v14M5 12h14"/>,
  dot:        (p) => <Icon {...p} fill="currentColor" s={<circle cx="12" cy="12" r="3"/>}/>,
  check:      (p) => <Icon {...p} d="m5 12 5 5L20 7"/>,
  x:          (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18"/>,
  chevDown:   (p) => <Icon {...p} d="m6 9 6 6 6-6"/>,
  chevRight:  (p) => <Icon {...p} d="m9 6 6 6-6 6"/>,
  chevLeft:   (p) => <Icon {...p} d="m15 6-6 6 6 6"/>,
  more:       (p) => <Icon {...p} fill="currentColor" stroke="none" s={<><circle cx="6"  cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></>}/>,
  inbox:      (p) => <Icon {...p} d="M3 12h4l2 3h6l2-3h4M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6M3 12l3-7h12l3 7"/>,
  home:       (p) => <Icon {...p} d="M3 11 12 4l9 7v8a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-8Z"/>,
  layers:     (p) => <Icon {...p} d="m12 2 10 5-10 5L2 7l10-5Zm10 10-10 5-10-5m20 5-10 5-10-5"/>,
  board:      (p) => <Icon {...p} d="M4 4h5v16H4zM10.5 4h5v10h-5zM17 4h3v14h-3z"/>,
  list:       (p) => <Icon {...p} d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>,
  filter:     (p) => <Icon {...p} d="M3 5h18l-7 9v5l-4-2v-3L3 5Z"/>,
  users:      (p) => <Icon {...p} d="M17 20v-2a4 4 0 0 0-3-3.87M7 20v-2a4 4 0 0 1 3-3.87M8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>,
  shield:     (p) => <Icon {...p} d="M12 3 4 6v6c0 4.5 3.5 8.5 8 9 4.5-.5 8-4.5 8-9V6l-8-3Z"/>,
  settings:   (p) => <Icon {...p} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.4l2-1.5-2-3.5-2.3.9a7.3 7.3 0 0 0-2.4-1.4l-.4-2.4h-4l-.4 2.4a7.3 7.3 0 0 0-2.4 1.4l-2.3-.9-2 3.5 2 1.5A7.4 7.4 0 0 0 4.6 12c0 .5 0 1 .1 1.4l-2 1.5 2 3.5 2.3-.9c.7.6 1.5 1 2.4 1.4l.4 2.4h4l.4-2.4c.9-.4 1.7-.8 2.4-1.4l2.3.9 2-3.5-2-1.5c.1-.4.1-.9.1-1.4Z"/>,
  bell:       (p) => <Icon {...p} d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Zm4 13a2 2 0 0 0 4 0"/>,
  calendar:   (p) => <Icon {...p} d="M3 8h18M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M8 3v4M16 3v4"/>,
  clock:      (p) => <Icon {...p} s={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}/>,
  tag:        (p) => <Icon {...p} d="M20 12 12 20 4 12V4h8l8 8ZM8 8h.01"/>,
  link:       (p) => <Icon {...p} d="M10 14a5 5 0 0 1 0-7l3-3a5 5 0 1 1 7 7l-2 2M14 10a5 5 0 0 1 0 7l-3 3a5 5 0 1 1-7-7l2-2"/>,
  lock:       (p) => <Icon {...p} d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>,
  mail:       (p) => <Icon {...p} d="M3 6h18v12H3zM3 6l9 7 9-7"/>,
  eye:        (p) => <Icon {...p} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>,
  eyeOff:     (p) => <Icon {...p} d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M6.1 6.1C3.5 7.8 2 12 2 12s3.5 7 10 7c2.1 0 4-.6 5.6-1.5M17.9 17.9 3 3m11.4 9.4A3 3 0 0 0 11.6 9.6M9 4.3A10 10 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.1"/>,
  arrowRight: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6"/>,
  arrowLeft:  (p) => <Icon {...p} d="M19 12H5M11 6l-6 6 6 6"/>,
  sparkle:    (p) => <Icon {...p} d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M6 18l4-4M14 10l4-4"/>,
  activity:   (p) => <Icon {...p} d="M3 12h4l3-9 4 18 3-9h4"/>,
  comments:   (p) => <Icon {...p} d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/>,
  paperclip:  (p) => <Icon {...p} d="m21 12-9 9a5 5 0 0 1-7-7L14 5a4 4 0 0 1 6 6l-9 9a2 2 0 0 1-3-3l8-8"/>,
  folder:     (p) => <Icon {...p} d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>,
  sun:        (p) => <Icon {...p} s={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>}/>,
  moon:       (p) => <Icon {...p} d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"/>,
  cmd:        (p) => <Icon {...p} d="M9 6H7a2 2 0 1 1 2-2v16a2 2 0 1 1-2-2h10a2 2 0 1 1-2 2V4a2 2 0 1 1 2 2H9Z"/>,
  dragHandle: (p) => <Icon {...p} fill="currentColor" stroke="none" s={<><circle cx="9"  cy="6"  r="1.3"/><circle cx="15" cy="6"  r="1.3"/><circle cx="9"  cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9"  cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></>}/>,
  trash:      (p) => <Icon {...p} d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>,
  copy:       (p) => <Icon {...p} d="M8 8h10v12H8zM8 8V4h8l4 4v10M16 4v4h4"/>,
  logout:     (p) => <Icon {...p} d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h12"/>,
  flag:       (p) => <Icon {...p} d="M4 22V4M4 4h13l-2 4 2 4H4"/>,
};

// ─── Status dot ──────────────────────────────────────────────────────────────

export type StatusValue = "todo" | "in_progress" | "done";

interface StatusDotProps { status: StatusValue; size?: number; }

export const StatusDot = ({ status, size = 12 }: StatusDotProps) => {
  if (status === "todo") return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--status-todo)" strokeWidth="1.5" strokeDasharray="2 1.2"/>
    </svg>
  );
  if (status === "in_progress") return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--status-progress)" strokeWidth="1.5"/>
      <path d="M8 2a6 6 0 0 1 0 12V2Z" fill="var(--status-progress)"/>
    </svg>
  );
  if (status === "done") return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="var(--status-done)"/>
      <path d="m5 8 2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
};

// ─── Priority bars ───────────────────────────────────────────────────────────

export type PriorityValue = "urgent" | "high" | "med" | "low" | "none";

interface PriorityBarsProps { level: PriorityValue; size?: number; }

export const PriorityBars = ({ level, size = 12 }: PriorityBarsProps) => {
  const count: Record<PriorityValue, number> = { urgent: 4, high: 3, med: 2, low: 1, none: 0 };
  const colors: Record<PriorityValue, string> = {
    urgent: "var(--priority-urgent)",
    high:   "var(--priority-high)",
    med:    "var(--priority-med)",
    low:    "var(--priority-low)",
    none:   "var(--text-4)",
  };
  const n = count[level];
  const color = colors[level];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{ color }}>
      {([0, 1, 2, 3] as const).map((i) => (
        <rect
          key={i}
          x={1 + i * 3.3} y={10 - i * 2.5}
          width="2.3" height={3 + i * 2.5}
          rx="0.6"
          fill={i < n ? "currentColor" : "var(--border-strong)"}
        />
      ))}
    </svg>
  );
};
