import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPage from "@/features/auth/pages/ForgotPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import InviteAcceptPage from "@/features/auth/pages/InviteAcceptPage";
import OAuthCallbackPage from "@/features/auth/pages/OAuthCallbackPage";
import WorkspaceSelectorPage from "@/features/workspace/pages/WorkspaceSelectorPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import WorkspacePage from "@/features/workspace/pages/WorkspacePage";
import ProjectPage from "@/features/project/pages/ProjectPage";
import MembersPage from "@/features/members/pages/MembersPage";
import WorkspaceSettingsPage from "@/features/settings/pages/WorkspaceSettingsPage";
import UserSettingsPage from "@/features/settings/pages/UserSettingsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function WorkspaceRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const workspace = useWorkspaceStore((s) => s.workspace);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!workspace) return <Navigate to="/workspaces" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/invite/:token" element={<InviteAcceptPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      {/* Protected — no workspace required */}
      <Route
        path="/workspaces"
        element={
          <ProtectedRoute>
            <WorkspaceSelectorPage />
          </ProtectedRoute>
        }
      />
      <Route path="/settings" element={<Navigate to="/workspaces" replace />} />

      {/* Workspace routes */}
      <Route
        path="/w/:slug"
        element={
          <WorkspaceRoute>
            <AppShell />
          </WorkspaceRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<WorkspacePage />} />
        <Route path="p/:key" element={<ProjectPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="settings" element={<WorkspaceSettingsPage />} />
        <Route path="account" element={<UserSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
