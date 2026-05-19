import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ redirectTo: "/admin" }} />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-semibold">Admin access required</h2>
        <p className="mt-2 text-sm">
          Your account has the <strong>{user.role}</strong> role. Use the admin sign-in page.
        </p>
      </div>
    );
  }

  return children;
}
