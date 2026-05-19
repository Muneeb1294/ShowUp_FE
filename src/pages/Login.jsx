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
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Sign in with GitHub</h1>
      <p className="mt-1 text-sm text-slate-600">
        Use your GitHub account to submit projects and pin favorites.
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && (
        <div className="mt-6">
          <AuthForm redirectTo={redirectTo} />
        </div>
      )}
    </main>
  );
}
