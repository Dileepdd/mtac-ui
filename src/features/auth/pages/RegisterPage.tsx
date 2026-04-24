import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { useAuthStore } from "@/stores/authStore";
import { registerApi } from "@/api/auth";

const criteria = [
  { label: "8+",  key: "length", test: (pw: string) => pw.length >= 8 },
  { label: "A",   key: "up",     test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "a",   key: "low",    test: (pw: string) => /[a-z]/.test(pw) },
  { label: "9",   key: "num",    test: (pw: string) => /\d/.test(pw) },
  { label: "#",   key: "sp",     test: (pw: string) => /[^\w\s]/.test(pw) },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  if (isAuthenticated) return <Navigate to="/workspaces" replace />;

  const passed = criteria.map((c) => c.test(password));
  const score  = passed.filter(Boolean).length;

  const strengthColor =
    score < 3 ? "#dc2626" : score < 5 ? "#d97706" : "var(--status-done)";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerApi({ name, email, password });
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      const firstDetail = err?.response?.data?.errors?.[0]?.message;
      setError(firstDetail ?? err?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 6, fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
        POST /auth/register
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>
        Create your account
      </h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        Have one?{" "}
        <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Full name" hint="Min 3 characters">
          <Input
            placeholder="Elena Navarro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            onClear={() => setName("")}
          />
        </Field>

        <Field label="Work email">
          <Input
            icon={I.mail({ size: 13 })}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onClear={() => setEmail("")}
          />
        </Field>

        <Field label="Password">
          <Input
            icon={I.lock({ size: 13 })}
            type="password"
            placeholder="Min 8 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Strength bar */}
          <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < score ? strengthColor : "var(--border)",
                  transition: "background 0.1s",
                }}
              />
            ))}
          </div>
          {/* Criteria badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 6, fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
            {criteria.map((c, i) => (
              <span key={c.key} style={{ color: passed[i] ? "var(--status-done)" : "var(--text-3)" }}>
                {passed[i] ? "✓" : "·"} {c.label}
              </span>
            ))}
          </div>
        </Field>

        {error && (
          <div style={{ fontSize: 12, color: "#dc2626" }}>{error}</div>
        )}

        <Btn
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
        >
          {loading ? "Creating account…" : "Create account"}
          {!loading && I.arrowRight({ size: 13, stroke: 2 })}
        </Btn>
      </form>

      <p style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 20, lineHeight: 1.5 }}>
        By creating an account you agree to our{" "}
        <a style={{ color: "var(--text-2)", cursor: "pointer" }}>Terms</a> and{" "}
        <a style={{ color: "var(--text-2)", cursor: "pointer" }}>Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}
