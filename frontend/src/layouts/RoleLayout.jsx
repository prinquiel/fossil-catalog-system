import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { WorkspaceNavProvider } from '../context/WorkspaceNavContext.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import './RoleLayout.css';

function IconHome() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 20l-6-2V4l6 2 6-2 6 2v14l-6-2-6 2zM15 4v14M9 6v14" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

/** Cuadrícula — catálogo de trabajo */
function IconCatalog() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z" />
    </svg>
  );
}

/** Documentos / estudios (no confundir con "search" dentro de "researcher") */
function IconStudies() {
  return (
    <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

/**
 * Rutas absolutas: NO usar includes('search') porque la palabra "researcher" la contiene.
 */
const pickIcon = (to) => {
  const path = to.split('?')[0];
  if (path.endsWith('/dashboard')) return IconHome;
  if (path.includes('/profile')) return IconUser;
  if (path.includes('/create-fossil') || path.includes('/create-study')) return IconPlus;
  if (path.includes('/my-fossils')) return IconList;
  if (path.includes('/catalog')) return IconCatalog;
  if (path.includes('/search')) return IconSearch;
  if (path.includes('/my-studies')) return IconStudies;
  if (path.includes('/study/')) return IconStudies;
  if (path.includes('/map')) return IconMap;
  if (path.includes('/fossil/')) return IconBook;
  if (path.includes('/edit-fossil')) return IconPlus;
  return IconBook;
};

/**
 * @param {{ variant: 'explorer' | 'researcher'; navTitle: string; tagline?: string; links: { to: string; label: string }[] }} props
 */
function RoleLayout({ variant, navTitle, tagline, links }) {
  const { user, loading, isAuthenticated, isExplorer, isResearcher, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const trapRef = useFocusTrap(menuOpen);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cerrar menú móvil al navegar
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const allowed = variant === 'explorer' ? isExplorer : variant === 'researcher' ? isResearcher : false;

  if (loading) {
    return (
      <div className="role-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#5b4c3a' }}>Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  const isDualNonAdmin = isExplorer && isResearcher && !isAdmin;
  if (isDualNonAdmin) {
    const p = location.pathname;
    if (p.startsWith('/explorer')) {
      const next = p.replace(/^\/explorer/, '/workspace/explorer');
      return <Navigate to={next || '/workspace/explorer/dashboard'} replace />;
    }
    if (p.startsWith('/researcher')) {
      const next = p.replace(/^\/researcher/, '/workspace/researcher');
      return <Navigate to={next || '/workspace/researcher/dashboard'} replace />;
    }
  }

  const subtitle =
    tagline ||
    (variant === 'explorer'
      ? 'Registros en campo'
      : 'Archivo publicado y estudios');

  return (
    <WorkspaceNavProvider explorerBase="/explorer" researcherBase="/researcher">
    <div className="role-shell">
      <div className="role-shell__inner">
        <header className="role-topbar">
          <Link to={links[0]?.to || '/'} className="role-brand">
            Fossil Catalog
          </Link>
          <div className="role-topbar__end">
            {variant === 'researcher' ? (
              <NavLink
                to="/researcher/my-studies"
                className={({ isActive }) => `role-topbar-studies${isActive ? ' is-active' : ''}`}
              >
                Mis estudios
              </NavLink>
            ) : null}
            <button
              type="button"
              className="role-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="role-sidebar-panel"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <div className="role-body">
          <aside className={`role-sidebar${menuOpen ? ' is-open' : ''}`}>
            <div
              className="role-sidebar__backdrop"
              onClick={() => setMenuOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
              role="presentation"
            />
            <div
              ref={trapRef}
              id="role-sidebar-panel"
              className="role-sidebar__panel"
              {...(menuOpen ? { role: 'dialog', 'aria-modal': true } : {})}
            >
              <p className="role-sidebar__title">{navTitle}</p>
              <p className="role-sidebar__tag">{subtitle}</p>
              <nav className="role-nav" aria-label="Secciones">
                {links.map(({ to, label }) => {
                  const Icon = pickIcon(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to.endsWith('dashboard')}
                      className={({ isActive }) => `role-nav__link${isActive ? ' is-active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon />
                      {label}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="role-sidebar__footer">
                <div className="role-link-row">
                  <Link to="/">Inicio</Link>
                  <Link to="/catalog">Ver catálogo público</Link>
                </div>
                <hr className="role-footer-rule" />
                <div className="role-user-chip">{user?.email || user?.username}</div>
                <button type="button" className="role-btn-ghost role-btn-ghost--logout" onClick={() => logout()}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>

          <main className="role-main">
            <div className="role-main-inner" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
    </WorkspaceNavProvider>
  );
}

export default RoleLayout;
