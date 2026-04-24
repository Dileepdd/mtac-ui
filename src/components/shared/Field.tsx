import type { ReactNode } from "react";

interface FieldProps {
  label?:    ReactNode;
  hint?:     string;
  error?:    string;
  children:  ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label style={{ display: "block" }}>
      {label && (
        <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 5, fontWeight: 500 }}>
          {label}
        </div>
      )}
      {children}
      {hint && !error && (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{error}</div>
      )}
    </label>
  );
}
