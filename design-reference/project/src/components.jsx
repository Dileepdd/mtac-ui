// Reusable primitive components.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Avatar: colored initials circle
const Avatar = ({ user, size = 22, ring = false }) => {
  if (!user) return (
    <div className="avatar-empty" style={{
      width: size, height: size, borderRadius: "50%",
      border: "1px dashed var(--border-strong)", color: "var(--text-4)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(9, size * 0.42), flex: "0 0 auto"
    }}>
      <I.plus size={Math.max(10, size * 0.5)} stroke={1.4}/>
    </div>
  );
  const bg = `oklch(0.88 0.08 ${user.hue})`;
  const fg = `oklch(0.32 0.1 ${user.hue})`;
  return (
    <div title={user.name} style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(9, size * 0.42), fontWeight: 600, letterSpacing: 0,
      fontFamily: "var(--font-mono)",
      boxShadow: ring ? "0 0 0 2px var(--bg)" : "none",
      flex: "0 0 auto"
    }}>{user.initials}</div>
  );
};

const AvatarStack = ({ users, max = 4, size = 20 }) => {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div style={{ display: "inline-flex" }}>
      {shown.map((u, i) => (
        <div key={u._id} style={{ marginLeft: i ? -6 : 0 }}>
          <Avatar user={u} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -6, width: size, height: size, borderRadius: "50%",
          background: "var(--bg-sub)", color: "var(--text-3)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontFamily: "var(--font-mono)",
          boxShadow: "0 0 0 2px var(--bg)"
        }}>+{extra}</div>
      )}
    </div>
  );
};

// Button
const Btn = ({ variant = "ghost", size = "sm", icon, children, onClick, kbd, style, disabled, type = "button", active }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: size === "md" ? 32 : size === "lg" ? 36 : 26,
    padding: size === "lg" ? "0 14px" : children ? "0 10px" : 0,
    width: children ? "auto" : (size === "md" ? 32 : size === "lg" ? 36 : 26),
    justifyContent: "center",
    fontSize: size === "lg" ? 13 : 12.5, fontWeight: 500,
    borderRadius: "var(--radius-sm)", border: "1px solid transparent",
    transition: "background 0.08s, border-color 0.08s, color 0.08s",
    color: "var(--text)", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  };
  const styles = {
    primary: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
    secondary: { background: "var(--bg-2)", borderColor: "var(--border)" },
    ghost: { background: active ? "var(--bg-hover)" : "transparent", color: active ? "var(--text)" : "var(--text-2)" },
    danger: { background: "transparent", color: "#dc2626" },
  }[variant] || {};
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "ghost") e.currentTarget.style.background = "var(--bg-hover)";
        if (variant === "secondary") e.currentTarget.style.background = "var(--bg-sub)";
        if (variant === "primary") e.currentTarget.style.background = "var(--accent-2)";
        if (variant === "danger") e.currentTarget.style.background = "#fef2f2";
      }}
      onMouseLeave={e => {
        if (variant === "ghost") e.currentTarget.style.background = active ? "var(--bg-hover)" : "transparent";
        if (variant === "secondary") e.currentTarget.style.background = "var(--bg-2)";
        if (variant === "primary") e.currentTarget.style.background = "var(--accent)";
        if (variant === "danger") e.currentTarget.style.background = "transparent";
      }}
      style={{ ...base, ...styles, ...style }}>
      {icon}
      {children}
      {kbd && <span className="kbd" style={{ marginLeft: 4 }}>{kbd}</span>}
    </button>
  );
};

// Label pill
const Tag = ({ children, color, style }) => {
  const c = color || { bg: "var(--bg-sub)", fg: "var(--text-2)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      height: 18, padding: "0 6px",
      background: c.bg, color: c.fg,
      borderRadius: 4, fontSize: 10.5, fontFamily: "var(--font-mono)",
      fontWeight: 500, letterSpacing: 0, ...style
    }}>{children}</span>
  );
};

// Project square: 16px rounded square with key initial
const ProjectGlyph = ({ project, size = 18 }) => {
  const c = PROJECT_COLORS[project.color] || PROJECT_COLORS.indigo;
  return (
    <span style={{
      width: size, height: size, borderRadius: Math.max(3, size * 0.22),
      background: c.bg, color: c.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(8, size * 0.48), fontWeight: 600, letterSpacing: 0,
      fontFamily: "var(--font-mono)",
      flex: "0 0 auto"
    }}>{project.key[0]}</span>
  );
};

// Modal shell
const Modal = ({ open, onClose, children, width = 560, padding = true }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(15,15,15,0.35)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "8vh", animation: "fade-in 0.12s ease-out",
    }} onMouseDown={onClose}>
      <div onMouseDown={e => e.stopPropagation()} style={{
        width, maxWidth: "92vw", maxHeight: "84vh", overflow: "auto",
        background: "var(--bg-2)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
        padding: padding ? 0 : 0,
        animation: "modal-in 0.16s ease-out",
      }}>{children}</div>
    </div>
  );
};

// Popover / dropdown
const Popover = ({ anchor, open, onClose, children, align = "start", width = 220, offsetY = 4 }) => {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!open || !anchor?.current) return;
    const r = anchor.current.getBoundingClientRect();
    const left = align === "end" ? r.right - width : r.left;
    setPos({ top: r.bottom + offsetY, left });
    const close = (e) => {
      if (!anchor.current?.contains(e.target)) onClose?.();
    };
    const esc = (e) => e.key === "Escape" && onClose?.();
    setTimeout(() => document.addEventListener("mousedown", close), 0);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open, anchor, align, width, offsetY, onClose]);
  if (!open || !pos) return null;
  return (
    <div style={{
      position: "fixed", top: pos.top, left: pos.left, width,
      background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", boxShadow: "var(--shadow-md)",
      zIndex: 90, padding: 4, animation: "slide-up 0.08s ease-out",
    }}>{children}</div>
  );
};

const MenuItem = ({ icon, children, kbd, onClick, danger, selected }) => (
  <button onClick={onClick}
    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%",
      height: 28, padding: "0 8px", borderRadius: 4,
      fontSize: 12.5, color: danger ? "#dc2626" : "var(--text)",
      textAlign: "left", background: "transparent",
    }}>
    <span style={{ width: 16, display: "inline-flex", justifyContent: "center", color: danger ? "#dc2626" : "var(--text-3)" }}>{icon}</span>
    <span style={{ flex: 1 }}>{children}</span>
    {selected && <I.check size={13} stroke={2}/>}
    {kbd && <span className="kbd">{kbd}</span>}
  </button>
);

// Field
const Field = ({ label, hint, error, children }) => (
  <label style={{ display: "block" }}>
    {label && <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 5, fontWeight: 500 }}>{label}</div>}
    {children}
    {hint && !error && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
    {error && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{error}</div>}
  </label>
);

const Input = ({ icon, rightEl, ...props }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 6,
    height: 32, padding: "0 10px",
    background: "var(--bg-2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    transition: "border-color 0.08s",
  }}
    onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
    onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}>
    {icon && <span style={{ color: "var(--text-3)", display: "inline-flex" }}>{icon}</span>}
    <input {...props} style={{
      flex: 1, border: "none", background: "transparent", outline: "none",
      fontSize: 13, color: "var(--text)", minWidth: 0,
    }}/>
    {rightEl}
  </div>
);

const Skeleton = ({ w = "100%", h = 12, style }) => (
  <div className="skeleton" style={{ width: w, height: h, ...style }} />
);

const EmptyState = ({ icon, title, body, action }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "48px 24px", gap: 12, color: "var(--text-3)", textAlign: "center",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: "var(--bg-sub)", border: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--text-3)",
    }}>{icon}</div>
    <div>
      <div style={{ color: "var(--text)", fontWeight: 500, fontSize: 13 }}>{title}</div>
      {body && <div style={{ fontSize: 12, marginTop: 2, maxWidth: 320 }}>{body}</div>}
    </div>
    {action}
  </div>
);

// Status select (used in task card + detail)
const STATUS_LABELS = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

Object.assign(window, {
  Avatar, AvatarStack, Btn, Tag, ProjectGlyph, Modal, Popover, MenuItem,
  Field, Input, Skeleton, EmptyState, STATUS_LABELS,
});
