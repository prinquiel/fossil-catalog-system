import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './public-info-pages.css';

export default function PublicNotifications() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className="public-card">
        <p className="public-page-kicker">Notificaciones</p>
        <h1 className="public-page-title">Centro de avisos</h1>
        <p className="public-page-lead">
          {isAuthenticated
            ? 'No hay notificaciones pendientes en esta versión. Los avisos críticos se muestran en tu espacio de trabajo.'
            : 'Inicia sesión para recibir notificaciones relacionadas con aprobaciones, revisiones y estados de fichas.'}
        </p>
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
