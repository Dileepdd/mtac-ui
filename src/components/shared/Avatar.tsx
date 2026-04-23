import { I } from "@/icons";
import type { User } from "@/types/domain";

interface AvatarProps {
  user?: User | null;
  size?: number;
  ring?: boolean;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function Avatar({ user, size = 22, ring = false }: AvatarProps) {
  if (!user) return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: "1px dashed var(--border-strong)", color: "var(--text-4)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(9, size * 0.42), flex: "0 0 auto",
    }}>
      <I.plus size={Math.max(10, size * 0.5)} stroke={1.4} />
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
      fontFamily: "var(--font-mono-ui)",
      boxShadow: ring ? "0 0 0 2px var(--bg)" : "none",
      flex: "0 0 auto",
    }}>
      {initials(user.name)}
    </div>
  );
}

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: number;
}

export function AvatarStack({ users, max = 4, size = 20 }: AvatarStackProps) {
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
          fontSize: 10, fontFamily: "var(--font-mono-ui)",
          boxShadow: "0 0 0 2px var(--bg)",
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}
