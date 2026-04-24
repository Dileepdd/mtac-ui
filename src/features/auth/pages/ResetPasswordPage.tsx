import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";
import { resetPasswordApi } from "@/api/auth";

const criteria = [
  { label: "8+", key: "length", test: (pw: string) => pw.length >= 8 },
  { label: "A",  key: "up",     test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "a",  key: "low",    test: (pw: string) => /[a-z]/.test(pw) },
  { label: "9",  key: "num",    test: (pw: string) => /\d/.test(pw) },
  { label: "#",  key: "sp",     test: (pw: string) => /[^\w\s]/.test(pw) },
] as const;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const passed = criteria.map((c) => c.test(password));
  const score  = passed.filter(Boolean).length;
  const strengthColor = score < 3 ? "#dc2626" : score < 5 ? "#d97706" : "var(--status-done)";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to reset password. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell>
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "var(--bg-sub)", border: "1px solid var(--border)", marginBottom: 20 }}>
            {I.check({ size: 20, stroke: 2, style: { color: "var(--status-done)" } })}          
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 8px" }}>
            Password updated
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 24px" }}>
            Your password has been reset successfully.
          </p>
          <Btn
            variant="primary"
            size="lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => navigate("/login")}
          >
            Sign in {I.arrowRight({ size: 13, stroke: 2 })}
          </Btn>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Link
        to="/login"
        style={{ color: "var(--text-3)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20, textDecoration: "none" }}
      >
        {I.arrowLeft({ size: 13 })} Back to sign in
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>
        Set new password
      </h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="New password">
          <Input
            icon={I.lock({ size: 13 })}
            type="password"
            placeholder="Min 8 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
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
          disabled={loading || score < 5}
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
        >
          {loading ? "Updating…" : "Update password"}
        </Btn>
      </form>
    </AuthShell>
  );
}
