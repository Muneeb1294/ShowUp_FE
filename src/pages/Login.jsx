import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthForm from "../components/AuthForm.jsx";
import { safeRedirect } from "../lib/safeRedirect.js";

export default function Login() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const redirectTo = safeRedirect(location.state?.redirectTo);

  if (!loading && user) {
    return <Navigate to={isAdmin ? "/admin" : redirectTo} replace />;
  }

  return (
    <main className="page-narrow">
      <header className="page-header">
        <p className="page-eyebrow">Account</p>
        <h1 className="page-title">Sign in with GitHub</h1>
        <p className="page-lead">
          Use your GitHub account to submit projects, pin favorites, and comment.
        </p>
      </header>

      {loading && <p className="mt-8 text-slate-500">Loading…</p>}

      {!loading && (
        <div className="mt-8">
          <AuthForm redirectTo={redirectTo} />
        </div>
      )}
    </main>
  );
}
