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
  const { user, loading, isAuthenticated, isExplorer, isResearcher, logout } = useAuth();
  const workspace = workspaceHomePath(user);
  const workspaceActive = workspaceAreaActive(pathname, workspace);
  const studiesAreaActive =
    pathname.startsWith('/researcher/my-studies') ||
    pathname.startsWith('/researcher/study/') ||
    pathname.includes('/researcher/create-study');
  const misRegistrosAreaActive =
    pathname.startsWith('/explorer/my-fossils') || pathname.startsWith('/explorer/edit-fossil');

  return (
    <header className="site-header" role="banner">
      <nav className="site-header__nav" aria-label="Navegación principal">
        <div className="site-header__nav-left">
          <Link to="/" className="site-header__brand">
            <span className="site-header__brand-title">Fossil Catalog</span>
            <span className="site-header__brand-tag">edición digital</span>
          </Link>
        </div>

        <div className="site-header__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
          >
            Inicio
          </NavLink>

          {!loading && isAuthenticated && isExplorer && (
            <NavLink
              to="/explorer/my-fossils"
              className={() => `site-header__pill${misRegistrosAreaActive ? ' is-active' : ''}`}
            >
              Mis Registros
            </NavLink>
          )}

          {!isAuthenticated && (
            <>
              <NavLink
                to="/catalog"
                className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
              >
                Catálogo
              </NavLink>
              <NavLink to="/map" className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}>
                Mapa
              </NavLink>
            </>
          )}

          {!loading && isAuthenticated && isResearcher && (
            <NavLink
              to="/researcher/my-studies"
              className={`site-header__pill site-header__pill--studies${studiesAreaActive ? ' is-active' : ''}`}
            >
              Mis estudios
            </NavLink>
          )}

          {!loading && isAuthenticated && workspace && (
            <Link
              to={workspace}
              className={`site-header__pill site-header__pill--accent${workspaceActive ? ' is-active' : ''}`}
              aria-current={workspaceActive ? 'page' : undefined}
            >
              Mi espacio
            </Link>
          )}

          <NavLink
            to="/contact"
            className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
          >
            Contacto
          </NavLink>

          {!loading && !isAuthenticated && (
            <NavLink
              to="/login"
              className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
            >
              Iniciar sesión
            </NavLink>
          )}
        </div>

        <div className="site-header__nav-right">
          {!loading && isAuthenticated ? (
            <div className="site-header__session">
              <span className="site-header__user" title={user?.email || user?.username}>
                {user?.email || user?.username}
              </span>
              <button type="button" className="site-header__logout" onClick={() => logout()}>
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
