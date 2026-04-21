import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserProfileSettings from '../../components/account/UserProfileSettings.jsx';
import './public-info-pages.css';

export default function PublicProfile() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className={`public-card${isAuthenticated ? ' public-card--profile-wide' : ''}`}>
        {!isAuthenticated ? (
          <>
            <p className="public-page-kicker">Perfil</p>
            <h1 className="public-page-title">Tu cuenta</h1>
            <p className="public-page-lead">
              Inicia sesión para ver y editar tu perfil: nombre, contacto, institución y más.
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
          <UserProfileSettings variant="public" />
        )}
      </section>
    </main>
  );
}
