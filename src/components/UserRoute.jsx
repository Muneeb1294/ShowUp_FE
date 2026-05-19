import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserRoute({ children }) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading...</p>;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
