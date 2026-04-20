import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { workspaceHomePath } from '../../utils/workspace.js';
import './SiteHeader.css';

function workspaceAreaActive(pathname, workspace) {
  if (!workspace) return false;
  if (workspace.startsWith('/admin')) return pathname.startsWith('/admin');
  if (workspace.startsWith('/explorer')) return pathname.startsWith('/explorer');
  if (workspace.startsWith('/researcher')) return pathname.startsWith('/researcher');
  return false;
}

function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, loading, isAuthenticated, logout } = useAuth();
  const workspace = workspaceHomePath(user);
  const workspaceActive = workspaceAreaActive(pathname, workspace);

  return (
    <header className="site-header" role="banner">
      <nav className="site-header__nav" aria-label="Navegación principal">
        <Link to="/" className="site-header__brand">
          <span className="site-header__brand-title">Fossil Catalog</span>
          <span className="site-header__brand-tag">edición digital</span>
        </Link>

        <div className="site-header__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
          >
            Catálogo
          </NavLink>

          {!loading && !isAuthenticated && (
            <>
              <NavLink
                to="/register"
                className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
              >
                Registrarse
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
              >
                Iniciar sesión
              </NavLink>
            </>
          )}

          {!loading && isAuthenticated && workspace && (
            <>
              <Link
                to={workspace}
                className={`site-header__pill site-header__pill--accent${workspaceActive ? ' is-active' : ''}`}
                aria-current={workspaceActive ? 'page' : undefined}
              >
                Mi espacio de trabajo
              </Link>
              <span className="site-header__user" title={user?.email || user?.username}>
                {user?.email || user?.username}
              </span>
              <button type="button" className="site-header__logout" onClick={() => logout()}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
