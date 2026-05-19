import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `text-sm font-medium ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          ShowUp
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          {!isAdmin && (
            <NavLink to="/submit" className={linkClass}>
              Submit
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Review Projects
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-slate-600">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full border border-slate-200"
                  />
                )}
                <span>
                  {user.name}
                  {user.github_login && (
                    <span className="ml-1 text-slate-400">@{user.github_login}</span>
                  )}
                  <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                    {user.role}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/admin/login"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Admin
              </NavLink>
              <NavLink
                to="/login"
                className="rounded bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Sign in
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
