import { useContext, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AuthPage } from "../pages/AuthPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DocumentViewerPage } from "../pages/DocumentViewerPage";
import { AccountSettingsPage } from "../pages/AccountSettingsPage";
import { StarredPage } from "../pages/StarredPage";
import { RecentPage } from "../pages/RecentPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { Sidebar } from "../components/layout/Sidebar";
import { Toast } from "../components/common/Toast";
import { Menu } from "lucide-react";

export function AppRoutes() {
  const { authed, user, logout, loading} = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
  };

  // Get current path for sidebar active state
  const getCurrentPath = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") return "/dashboard";
    if (path.startsWith("/documents")) return "/documents";
    if (path === "/account") return "/account";
    if (path === "/starred") return "/starred";
    if (path === "/recent") return "/recent";
    return path;
  };

   if (loading) {
    return <div>Loading...</div>;
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="/shared/view/:token" element={<DocumentViewerPage isPublicShare={true} />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          activePath={getCurrentPath()}
          user={user || MOCK_USER}
          onLogout={handleLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <div className="lg:hidden h-14 bg-slate-900 border-b border-slate-800/70 flex items-center gap-3 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              {/* FolderOpen icon */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
                width="13"
                height="13"
              >
                <path d="M3 3h8l2 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              FileArchive
            </span>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:slug"
            element={
              <ProtectedRoute>
                <DocumentViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettingsPage
                  user={user || MOCK_USER}
                  showToast={showToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/starred"
            element={
              <ProtectedRoute>
                <StarredPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recent"
            element={
              <ProtectedRoute>
                <RecentPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
