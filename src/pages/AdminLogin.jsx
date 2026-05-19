import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AdminLoginForm from "../components/AdminLoginForm.jsx";
import { safeRedirect } from "../lib/safeRedirect.js";

export default function AdminLogin() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const redirectTo = safeRedirect(location.state?.redirectTo, "/admin");

  if (!loading && user && isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!loading && user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page-narrow">
      <header className="page-header">
        <p className="page-eyebrow">Administration</p>
        <h1 className="page-title">Admin sign in</h1>
        <p className="page-lead">
          Sign in with your admin credentials to review projects.
        </p>
      </header>

      {loading && <p className="mt-8 text-slate-500">Loading…</p>}

      {!loading && (
        <div className="mt-8">
          <AdminLoginForm redirectTo={redirectTo} />
        </div>
      )}
    </main>
  );
}
