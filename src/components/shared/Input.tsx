import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?:    ReactNode;
  rightEl?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, rightEl, ...props }, ref) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 6,
        height: 32, padding: "0 10px",
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        transition: "border-color 0.08s",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {icon && (
        <span style={{ color: "var(--text-3)", display: "inline-flex" }}>{icon}</span>
      )}
      <input ref={ref} {...props} style={{
        flex: 1, border: "none", background: "transparent", outline: "none",
        fontSize: 13, color: "var(--text)", minWidth: 0,
      }} />
      {rightEl}
    </div>
  );
});
