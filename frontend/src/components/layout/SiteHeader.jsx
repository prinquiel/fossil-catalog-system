import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  isExplorerAndResearcher,
  workspaceHomePath,
  explorerMyRecordsPath,
  researcherMyStudiesPath,
  WORKSPACE_MIS_APORTES_PATH,
} from '../../utils/workspace.js';
import './SiteHeader.css';

function workspaceAreaActive(pathname, workspace) {
  if (!workspace) return false;
  if (workspace.startsWith('/admin')) return pathname.startsWith('/admin');
  if (workspace.startsWith('/workspace')) return pathname.startsWith('/workspace');
  if (workspace.startsWith('/explorer')) return pathname.startsWith('/explorer');
  if (workspace.startsWith('/researcher')) return pathname.startsWith('/researcher');
  return false;
}

function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, isAuthenticated, isExplorer, isResearcher, isAdmin, logout } = useAuth();
  const workspace = workspaceHomePath(user);

  const dualNav =
    !loading && isAuthenticated && isExplorerAndResearcher(user) && !isAdmin;

  const publicStudiesNavActive =
    pathname === '/catalog/estudios' || pathname.startsWith('/catalog/estudio/');

  const misAportesAreaActive = useMemo(
    () =>
      pathname.startsWith(WORKSPACE_MIS_APORTES_PATH) ||
      pathname.startsWith('/workspace/nuevo-aporte') ||
      pathname.startsWith('/workspace/explorer/my-fossils') ||
      pathname.startsWith('/workspace/explorer/edit-fossil') ||
      pathname.startsWith('/workspace/explorer/create-fossil') ||
      pathname.startsWith('/workspace/researcher/my-studies') ||
      pathname.startsWith('/workspace/researcher/study/') ||
      pathname.includes('/workspace/researcher/create-study'),
    [pathname]
  );

  const studiesAreaActive =
    pathname.startsWith('/researcher/my-studies') ||
    pathname.startsWith('/researcher/study/') ||
    pathname.includes('/researcher/create-study') ||
    pathname.startsWith('/workspace/researcher/my-studies') ||
    pathname.startsWith('/workspace/researcher/study/') ||
    pathname.includes('/workspace/researcher/create-study');

  const misRegistrosAreaActive =
    pathname.startsWith('/explorer/my-fossils') ||
    pathname.startsWith('/explorer/edit-fossil') ||
    pathname.startsWith('/workspace/explorer/my-fossils') ||
    pathname.startsWith('/workspace/explorer/edit-fossil');

  const workspaceActive = workspaceAreaActive(pathname, workspace);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  return (
    <header className="site-header" role="banner">
      <nav className="site-header__nav" aria-label="Navegación principal">
        <div className="site-header__nav-left">
          <Link to="/" className="site-header__brand">
            <span className="site-header__brand-title">Fossil Catalog</span>
            <span className="site-header__brand-tag">edición digital</span>
          </Link>
        </div>

        <button
          type="button"
          className="site-header__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-header-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        <div id="site-header-menu" className={`site-header__menu${menuOpen ? ' is-open' : ''}`}>
          <div className="site-header__links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
            >
              Inicio
            </NavLink>

            <NavLink
              to="/catalog/estudios"
              className={() => `site-header__pill${publicStudiesNavActive ? ' is-active' : ''}`}
            >
              Estudios
            </NavLink>

            {dualNav ? (
              <>
                <NavLink
                  to={WORKSPACE_MIS_APORTES_PATH}
                  className={() => `site-header__pill${misAportesAreaActive ? ' is-active' : ''}`}
                >
                  Mis Aportes
                </NavLink>
                {workspace ? (
                  <Link
                    to={workspace}
                    className={`site-header__pill site-header__pill--accent${workspaceActive ? ' is-active' : ''}`}
                    aria-current={workspaceActive ? 'page' : undefined}
                  >
                    Mi espacio
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                {!loading && isAuthenticated && isExplorer && (
                  <NavLink
                    to={explorerMyRecordsPath(user)}
                    className={() => `site-header__pill${misRegistrosAreaActive ? ' is-active' : ''}`}
                  >
                    Mis registros
                  </NavLink>
                )}

                {!isAuthenticated && (
                  <NavLink
                    to="/catalog"
                    className={({ isActive }) => `site-header__pill${isActive ? ' is-active' : ''}`}
                  >
                    Catálogo
                  </NavLink>
                )}

                {!loading && isAuthenticated && isResearcher && (
                  <NavLink
                    to={researcherMyStudiesPath(user)}
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
              </>
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
        </div>
      </nav>
    </header>
  );
}

export default SiteHeader;
