import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { I } from "@/icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?:    ReactNode;
  rightEl?: ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ icon, rightEl, onClear, type, value, ...props }, ref) {
    const [hovered, setHovered] = useState(false);
    const [showPw, setShowPw]   = useState(false);

    const isPassword = type === "password";
    const actualType = isPassword ? (showPw ? "text" : "password") : type;

    let rightContent: ReactNode = rightEl;
    if (isPassword) {
      rightContent = (
        <button
          type="button"
          onClick={() => setShowPw((p) => !p)}
          tabIndex={-1}
          style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", padding: 0, flexShrink: 0 }}
        >
          {showPw ? I.eyeOff({ size: 13 }) : I.eye({ size: 13 })}
        </button>
      );
    } else if (onClear) {
      const hasValue = value !== undefined && value !== "";
      rightContent = (
        <button
          type="button"
          onClick={onClear}
          tabIndex={-1}
          aria-label="Clear"
          style={{
            cursor: "pointer", display: "inline-flex", color: "var(--text-3)",
            border: "none", background: "transparent", padding: "4px", flexShrink: 0,
            opacity: hovered && hasValue ? 1 : 0,
            transition: "opacity 0.1s",
            pointerEvents: hovered && hasValue ? "auto" : "none",
          }}
        >
          {I.x({ size: 13 })}
        </button>
      );
    }

    return (
      <div
        style={{
          display: "flex", alignItems: "center", gap: 6,
          height: 32, padding: "0 10px",
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          transition: "border-color 0.08s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        {icon && (
          <span style={{ color: "var(--text-3)", display: "inline-flex", flexShrink: 0 }}>{icon}</span>
        )}
        <input
          ref={ref}
          type={actualType}
          value={value}
          {...props}
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--text)", minWidth: 0 }}
        />
        {rightContent}
      </div>
    );
  }
);
