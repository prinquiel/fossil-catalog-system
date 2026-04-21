import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { WorkspaceNavProvider } from '../context/WorkspaceNavContext.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import '../pages/admin/adminPages.css';
import './AdminLayout.css';
import './DualRoleLayout.css';

const NAV = [
  { to: '/workspace/inicio', label: 'Inicio', end: true },
  { to: '/workspace/researcher/search', label: 'Buscar', end: false },
  { to: '/workspace/nuevo-aporte', label: 'Nuevo aporte', end: false },
  { to: '/workspace/mis-aportes', label: 'Mis aportes', end: false },
  { to: '/workspace/researcher/catalog', label: 'Catálogo', end: false },
  { to: '/workspace/researcher/map', label: 'Mapa', end: false },
  { to: '/workspace/explorer/profile', label: 'Perfil', end: false },
];

function IconHome() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 20l-6-2V4l6 2 6-2 6 2v14l-6-2-6 2zM15 4v14M9 6v14" />
    </svg>
  );
}

function IconCatalog() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z" />
    </svg>
  );
}

const ICONS = {
  '/workspace/inicio': IconHome,
  '/workspace/researcher/search': IconSearch,
  '/workspace/nuevo-aporte': IconPlus,
  '/workspace/mis-aportes': IconList,
  '/workspace/researcher/catalog': IconCatalog,
  '/workspace/researcher/map': IconMap,
  '/workspace/explorer/profile': IconUser,
};

function DualRoleLayout() {
  const { user, loading, isAuthenticated, isExplorer, isResearcher, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const trapRef = useFocusTrap(menuOpen);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="admin-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Source Sans 3, sans-serif', color: '#5b4c3a' }}>Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isExplorer || !isResearcher) {
    return <Navigate to="/403" replace />;
  }

  return (
    <WorkspaceNavProvider explorerBase="/workspace/explorer" researcherBase="/workspace/researcher">
      <div className="admin-shell">
        <div className="admin-shell__inner">
          <header className="admin-topbar">
            <Link to="/workspace/inicio" className="admin-brand">
              Espacio de trabajo
            </Link>
            <button
              type="button"
              className="admin-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="dual-sidebar-panel"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
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
          </header>

          <div className="admin-body">
            <aside className={`admin-sidebar${menuOpen ? ' is-open' : ''}`}>
              <div
                className="admin-sidebar__backdrop"
                onClick={() => setMenuOpen(false)}
                onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
                role="presentation"
              />
              <div
                ref={trapRef}
                id="dual-sidebar-panel"
                className="admin-sidebar__panel"
                {...(menuOpen ? { role: 'dialog', 'aria-modal': true } : {})}
              >
                <p className="admin-sidebar__brand">Espacio de trabajo</p>
                <p className="admin-sidebar__tag dual-sidebar__tag">Campo e investigación</p>
                <nav className="admin-nav" aria-label="Secciones explorador e investigador">
                  {NAV.map(({ to, label, end }) => {
                    const Icon = ICONS[to] || IconHome;
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        end={end ?? false}
                        className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon />
                        {label}
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="admin-sidebar__footer">
                  <div className="admin-footer-links">
                    <Link to="/" className="admin-link-home">
                      Inicio público
                    </Link>
                    <Link to="/catalog" className="admin-link-home">
                      Ver catálogo público
                    </Link>
                  </div>
                  <hr className="admin-footer-rule" />
                  <div className="admin-user-chip">{user?.email || user?.username}</div>
                  <button type="button" className="admin-btn-ghost admin-btn-ghost--logout" onClick={() => logout()}>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </aside>

            <main className="admin-main">
              <div className="admin-main-inner" key={location.pathname}>
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </WorkspaceNavProvider>
  );
}

export default DualRoleLayout;
