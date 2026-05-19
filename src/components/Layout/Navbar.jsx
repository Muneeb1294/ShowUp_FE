import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? "nav-link-active" : ""}`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-indigo-600 transition hover:text-indigo-700"
        >
          ShowUp
        </Link>

        <nav className="flex items-center gap-6">
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
              Review
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="flex items-center gap-2.5 text-slate-600">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                )}
                <span className="hidden sm:inline">
                  <span className="font-medium text-slate-800">{user.name}</span>
                  {user.github_login && (
                    <span className="ml-1 text-slate-400">
                      @{user.github_login}
                    </span>
                  )}
                  <span className="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {user.role}
                  </span>
                </span>
              </span>
              <button type="button" onClick={logout} className="btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/admin/login" className="nav-link">
                Admin
              </NavLink>
              <NavLink to="/login" className="btn-primary btn-sm">
                Sign in
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
