import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './public-info-pages.css';

export default function PublicProfile() {
  const { user, isAuthenticated } = useAuth();

  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className="public-card">
        <p className="public-page-kicker">Perfil</p>
        <h1 className="public-page-title">Tu cuenta</h1>
        {!isAuthenticated ? (
          <>
            <p className="public-page-lead">
              Inicia sesión para ver el resumen de tu perfil y acceder a tu espacio de trabajo.
            </p>
            <div className="public-page-actions">
              <Link to="/login" className="public-btn">
                Iniciar sesión
              </Link>
              <Link to="/register" className="public-btn public-btn--ghost">
                Crear cuenta
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="public-page-lead">Información básica de la sesión activa.</p>
            <dl className="public-dl">
              <div>
                <dt>Usuario</dt>
                <dd>{user?.username || '—'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{user?.email || '—'}</dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>{Array.isArray(user?.roles) ? user.roles.join(', ') : user?.role || '—'}</dd>
              </div>
              <div>
                <dt>Profesión</dt>
                <dd>{user?.profession || '—'}</dd>
              </div>
              <div>
                <dt>Centro de trabajo</dt>
                <dd>{user?.workplace || '—'}</dd>
              </div>
            </dl>
            <div className="public-page-actions">
              <Link to="/" className="public-btn public-btn--ghost">
                Volver al inicio
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
