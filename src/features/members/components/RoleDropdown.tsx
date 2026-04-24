import { useRef, useState } from "react";
import { Popover, MenuItem } from "@/components/shared/Popover";
import { I } from "@/icons";
import type { RoleItem } from "@/api/role";

interface RoleDropdownProps {
  role: RoleItem;
  roles: RoleItem[];
  disabled?: boolean;
  onChange: (role: RoleItem) => void;
}

export function RoleDropdown({ role, roles, disabled, onChange }: RoleDropdownProps) {
  const ref  = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={ref}
        onClick={() => { if (!disabled) setOpen(true); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 24, padding: "0 8px", borderRadius: 4,
          background: "var(--bg-sub)", border: "1px solid var(--border)",
          fontSize: 11.5, fontWeight: 500, color: "var(--text)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {I.shield({ size: 11, style: { color: "var(--text-3)" } })}
        {role.name}
        {!disabled && I.chevDown({ size: 10, stroke: 2, style: { color: "var(--text-3)" } })}
      </button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)}>
        {roles.map((r) => (
          <MenuItem
            key={r._id}
            icon={I.shield({ size: 13 })}
            selected={r._id === role._id}
            onClick={() => { onChange(r); setOpen(false); }}
          >
            <div>
              <div>{r.name}</div>
              <div className="mono" style={{ color: "var(--text-4)", fontSize: 10 }}>
                {r.all_permissions ? "all perms" : `${r.permissions.length} perms`}
              </div>
            </div>
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}
