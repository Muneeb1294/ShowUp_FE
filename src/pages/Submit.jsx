import { useAuth } from "../context/AuthContext.jsx";
import AuthForm from "../components/AuthForm.jsx";
import SubmitProjectForm from "../components/SubmitProjectForm.jsx";

export default function Submit() {
  const { user, loading } = useAuth();

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Submit a project</h1>
      <p className="mt-1 text-sm text-slate-600">
        Share a public GitHub repository. We fetch its metadata and send it for admin approval.
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && !user && (
        <div className="mt-6 max-w-sm">
          <p className="mb-4 text-slate-600">
            Sign in with GitHub to submit a project.
          </p>
          <AuthForm redirectTo="/submit" />
        </div>
      )}

      {!loading && user && (
        <div className="mt-6">
          <SubmitProjectForm />
        </div>
      )}
    </main>
  );
}
