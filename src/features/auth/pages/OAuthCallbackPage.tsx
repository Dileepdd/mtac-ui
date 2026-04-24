import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { getProfileApi } from "@/api/auth";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    // Strict Mode fires effects twice in dev — guard against double execution
    if (ran.current) return;
    ran.current = true;

    const error        = searchParams.get("error");
    const accessToken  = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (error || !accessToken || !refreshToken) {
      toast.error("Google sign-in failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    getProfileApi(accessToken)
      .then((user) => {
        setAuth(user, accessToken, refreshToken);
        navigate("/workspaces", { replace: true });
      })
      .catch(() => {
        toast.error("Could not load your profile. Please try again.");
        navigate("/login", { replace: true });
      });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg)",
    }}>
      <span style={{ color: "var(--text-3)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
        Signing you in…
      </span>
    </div>
  );
}
