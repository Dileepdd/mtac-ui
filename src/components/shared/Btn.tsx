import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface BtnProps {
  variant?:  Variant;
  size?:     Size;
  icon?:     ReactNode;
  children?: ReactNode;
  onClick?:  () => void;
  kbd?:      string;
  style?:    CSSProperties;
  disabled?: boolean;
  type?:     "button" | "submit" | "reset";
  active?:   boolean;
}

export function Btn({
  variant  = "ghost",
  size     = "sm",
  icon,
  children,
  onClick,
  kbd,
  style,
  disabled,
  type  = "button",
  active,
}: BtnProps) {
  const h = size === "md" ? 32 : size === "lg" ? 36 : 26;

  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: h,
    padding: size === "lg" ? "0 14px" : children ? "0 10px" : 0,
    width: children ? "auto" : h,
    justifyContent: "center",
    fontSize: size === "lg" ? 13 : 12.5, fontWeight: 500,
    borderRadius: "var(--radius-sm)", border: "1px solid transparent",
    transition: "background 0.08s, border-color 0.08s, color 0.08s",
    color: "var(--text)", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  };

  const variantStyle: CSSProperties = (
    variant === "primary"   ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } :
    variant === "secondary" ? { background: "var(--bg-2)", borderColor: "var(--border)" } :
    variant === "ghost"     ? { background: active ? "var(--bg-hover)" : "transparent", color: active ? "var(--text)" : "var(--text-2)" } :
    variant === "danger"    ? { background: "transparent", color: "#dc2626" } :
    {}
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "ghost")     e.currentTarget.style.background = "var(--bg-hover)";
        if (variant === "secondary") e.currentTarget.style.background = "var(--bg-sub)";
        if (variant === "primary")   e.currentTarget.style.background = "var(--accent-2)";
        if (variant === "danger")    e.currentTarget.style.background = "#fef2f2";
      }}
      onMouseLeave={(e) => {
        if (variant === "ghost")     e.currentTarget.style.background = active ? "var(--bg-hover)" : "transparent";
        if (variant === "secondary") e.currentTarget.style.background = "var(--bg-2)";
        if (variant === "primary")   e.currentTarget.style.background = "var(--accent)";
        if (variant === "danger")    e.currentTarget.style.background = "transparent";
      }}
      style={{ ...base, ...variantStyle, ...style }}
    >
      {icon}
      {children}
      {kbd && <span className="kbd" style={{ marginLeft: 4 }}>{kbd}</span>}
    </button>
  );
}
