import type { ReactNode } from "react";

interface EmptyStateProps {
  icon:     ReactNode;
  title:    string;
  body?:    string;
  action?:  ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px", gap: 12, color: "var(--text-3)", textAlign: "center",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: "var(--bg-sub)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-3)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: "var(--text)", fontWeight: 500, fontSize: 13 }}>{title}</div>
        {body && <div style={{ fontSize: 12, marginTop: 2, maxWidth: 320 }}>{body}</div>}
      </div>
      {action}
    </div>
  );
}
