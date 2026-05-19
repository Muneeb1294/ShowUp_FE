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
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin sign in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Sign in with your admin credentials to review projects.
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && (
        <div className="mt-6">
          <AdminLoginForm redirectTo={redirectTo} />
        </div>
      )}
    </main>
  );
}
