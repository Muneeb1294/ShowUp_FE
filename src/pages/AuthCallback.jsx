import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/auth.js";
import { safeRedirect } from "../lib/safeRedirect.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeGithubAuth } = useAuth();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const oauthError = searchParams.get("error");
    const redirectTo = safeRedirect(searchParams.get("redirect"));
    const token = searchParams.get("token");

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!token) {
      setError("Missing sign-in token. Please try again.");
      return;
    }

    completeGithubAuth(token)
      .then(() => navigate(redirectTo, { replace: true }))
      .catch((err) => setError(getErrorMessage(err)));
  }, [searchParams, completeGithubAuth, navigate]);

  if (error) {
    return (
      <main className="page-narrow">
        <header className="page-header">
          <p className="page-eyebrow">Account</p>
          <h1 className="page-title">Sign-in failed</h1>
        </header>
        <p role="alert" className="alert-error mt-6">
          {error}
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="page-narrow">
      <p className="text-slate-600">Completing GitHub sign-in…</p>
    </main>
  );
}
