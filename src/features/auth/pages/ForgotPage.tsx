import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuthStore } from "@/stores/authStore";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Btn } from "@/components/shared/Btn";
import { I } from "@/icons";

export default function ForgotPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/workspaces" replace />;

  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell>
      <Link
        to="/login"
        style={{
          color: "var(--text-3)",
          fontSize: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 20,
          textDecoration: "none",
        }}
      >
        {I.arrowLeft({ size: 13 })} Back to sign in
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.02, margin: "0 0 4px" }}>
        Reset your password
      </h1>
      <p style={{ color: "var(--text-3)", margin: "0 0 24px", fontSize: 13 }}>
        Enter your email and we'll send a reset link.
      </p>

      {!sent ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Email">
            <Input
              icon={I.mail({ size: 13 })}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              rightEl={
                email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    style={{ cursor: "pointer", display: "inline-flex", color: "var(--text-3)", border: "none", background: "transparent", padding: "4px" }}
                    title="Clear"
                  >
                    {I.x({ size: 14 })}
                  </button>
                )
              }
            />
          </Field>
          <Btn
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </Btn>
        </form>
      ) : (
        <div style={{
          padding: 16,
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-sub)",
          fontSize: 13,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--status-done)", marginBottom: 6 }}>
            {I.check({ size: 14, stroke: 2 })}
            <strong style={{ fontWeight: 500, color: "var(--text)" }}>Check your email</strong>
          </div>
          <p style={{ margin: 0, color: "var(--text-3)" }}>
            If an account matches, a reset link is on its way.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
