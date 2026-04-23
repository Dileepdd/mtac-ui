interface StatCardProps {
  label:   string;
  value:   string | number;
  delta?:  number;
  unit?:   string;
  hint?:   string;
}

export function StatCard({ label, value, delta, unit, hint }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono-ui)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: "var(--text)" }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: "var(--text-3)" }}>{unit}</span>}
      </div>
      {delta !== undefined && (
        <div style={{
          fontSize: 11.5, marginTop: 6,
          color: delta >= 0 ? "var(--status-done)" : "#dc2626",
          fontFamily: "var(--font-mono-ui)",
        }}>
          {delta >= 0 ? "+" : ""}{delta}%
        </div>
      )}
      {hint && (
        <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}
