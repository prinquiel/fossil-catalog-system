import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './public-info-pages.css';

export default function PublicSettings() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className="public-card">
        <p className="public-page-kicker">Configuración</p>
        <h1 className="public-page-title">Preferencias de cuenta</h1>
        <p className="public-page-lead">
          {isAuthenticated
            ? 'La edición avanzada de preferencias se realiza desde módulos por rol. Esta vista resume los accesos disponibles.'
            : 'Inicia sesión para configurar preferencias y revisar permisos por rol.'}
        </p>
        <ul className="public-list">
          <li>Control de sesión y seguridad a través de autenticación JWT.</li>
          <li>Permisos por rol para explorador, investigador y administrador.</li>
          <li>Preferencias de visualización según módulo activo.</li>
        </ul>
        <div className="public-page-actions">
          {isAuthenticated ? (
            <Link to="/" className="public-btn public-btn--ghost">
              Volver al inicio
            </Link>
          ) : (
            <Link to="/login" className="public-btn">
              Iniciar sesión
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
