import { useAuth } from "../context/AuthContext.jsx";
import AuthForm from "../components/AuthForm.jsx";
import SubmitProjectForm from "../components/SubmitProjectForm.jsx";

export default function Submit() {
  const { user, loading } = useAuth();

  return (
    <main className="page-narrow">
      <header className="page-header">
        <p className="page-eyebrow">Contribute</p>
        <h1 className="page-title">Submit a project</h1>
        <p className="page-lead">
          Share a public GitHub repository. We fetch its metadata and send it for
          admin approval.
        </p>
      </header>

      {loading && (
        <p className="mt-8 text-slate-500">Loading…</p>
      )}

      {!loading && !user && (
        <div className="mt-8">
          <p className="mb-4 text-slate-600">
            Sign in with GitHub to submit a project.
          </p>
          <AuthForm redirectTo="/submit" />
        </div>
      )}

      {!loading && user && (
        <div className="mt-8">
          <SubmitProjectForm />
        </div>
      )}
    </main>
  );
}
