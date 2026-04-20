import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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

const pickIcon = (to) => {
  if (to.includes('dashboard')) return IconHome;
  if (to.includes('create') || to.includes('study')) return IconPlus;
  if (to.includes('profile')) return IconUser;
  if (to.includes('search')) return IconSearch;
  if (to.includes('map')) return IconMap;
  if (to.includes('catalog') || to.includes('fossils')) return IconList;
  return IconBook;
};

/**
 * @param {{ variant: 'explorer' | 'researcher'; navTitle: string; tagline?: string; links: { to: string; label: string }[] }} props
 */
function RoleLayout({ variant, navTitle, tagline, links }) {
  const { user, loading, isAuthenticated, isExplorer, isResearcher, logout } = useAuth();
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

  const subtitle = tagline || (variant === 'explorer' ? 'Campo y catalogación' : 'Estudios y catálogo');

  return (
    <div className="role-shell">
      <div className="role-shell__inner">
        <header className="role-topbar">
          <Link to={links[0]?.to || '/'} className="role-brand">
            Fossil Catalog
          </Link>
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
                <div className="role-user-chip">{user?.email || user?.username}</div>
                <button type="button" className="role-btn-ghost" onClick={() => logout()}>
                  Cerrar sesión
                </button>
                <div className="role-link-row">
                  <Link to="/catalog">Ver catálogo público</Link>
                  <Link to="/">Inicio</Link>
                </div>
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
  );
}

export default RoleLayout;
