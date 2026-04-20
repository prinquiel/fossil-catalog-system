import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import '../pages/admin/adminPages.css';
import './AdminLayout.css';

const NAV = [
  { to: '/admin/dashboard', label: 'Panel', end: false },
  { to: '/admin/pending-registrations', label: 'Registros pendientes', end: false },
  { to: '/admin/pending-fossils', label: 'Fósiles pendientes', end: false },
  { to: '/admin/pending-studies', label: 'Estudios pendientes', end: false },
  { to: '/admin/fossils', label: 'Fósiles', end: false },
  { to: '/admin/users', label: 'Usuarios', end: false },
  { to: '/admin/create-user', label: 'Crear usuario', end: false },
  { to: '/admin/messages', label: 'Mensajes', end: false },
  { to: '/admin/audit', label: 'Auditoría', end: false },
  { to: '/admin/stats', label: 'Estadísticas', end: false },
];

function IconPanel() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4V4zM4 9h16M9 14h6" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3c-4 4-6 8-6 12a6 6 0 0012 0c0-4-2-8-6-12z" />
      <path d="M12 15v-3" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 10-8 0M4 20a8 8 0 0116 0M20 21v-2a4 4 0 00-3-3.87" />
    </svg>
  );
}

function IconPlusUser() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 10-8 0M4 20a8 8 0 0116 0M20 8v6M23 11h-6" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4V4zM4 8l8 6 8-6" />
    </svg>
  );
}

function IconAudit() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h10M4 18h7M14 18l4-4 2 2" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V14" />
    </svg>
  );
}

function IconStudies() {
  return (
    <svg className="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

const ICONS = {
  '/admin/dashboard': IconPanel,
  '/admin/pending-registrations': IconInbox,
  '/admin/pending-fossils': IconLeaf,
  '/admin/pending-studies': IconStudies,
  '/admin/fossils': IconLeaf,
  '/admin/users': IconUsers,
  '/admin/create-user': IconPlusUser,
  '/admin/messages': IconMail,
  '/admin/audit': IconAudit,
  '/admin/stats': IconChart,
};

function AdminLayout() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
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

  if (loading) {
    return (
      <div className="admin-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Source Sans 3, sans-serif', color: '#5b4c3a' }}>Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin/dashboard' } }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="admin-shell">
      <div className="admin-shell__inner">
        <header className="admin-topbar">
          <Link to="/admin/dashboard" className="admin-brand">
            Fossil Catalog — Admin
          </Link>
          <button
            type="button"
            className="admin-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar-panel"
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
              id="admin-sidebar-panel"
              className="admin-sidebar__panel"
              {...(menuOpen ? { role: 'dialog', 'aria-modal': true } : {})}
            >
              <p className="admin-sidebar__brand">Administración</p>
              <p className="admin-sidebar__tag">Panel curatorial</p>
              <nav className="admin-nav" aria-label="Secciones admin">
                {NAV.map(({ to, label }) => {
                  const Icon = ICONS[to] || IconPanel;
                  return (
                    <NavLink
                      key={to}
                      to={to}
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
                    Inicio
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
  );
}

export default AdminLayout;
