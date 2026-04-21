import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import './public-info-pages.css';

export default function PublicAbout() {
  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className="public-card">
        <p className="public-page-kicker">Acerca del sistema</p>
        <h1 className="public-page-title">Museo digital de hallazgos fósiles</h1>
        <p className="public-page-lead">
          Plataforma para catalogar, revisar y publicar evidencia paleontológica con trazabilidad de roles.
        </p>
      </section>

      <section className="public-card">
        <div className="public-grid-two">
          <article>
            <h2>Qué ofrece</h2>
            <ul className="public-list">
              <li>Registro de hallazgos por exploradores con georreferencia y multimedia.</li>
              <li>Validación editorial por administradores antes de publicar.</li>
              <li>Consulta pública de catálogo, estudios y mapa interactivo.</li>
              <li>Herramientas de búsqueda para investigadores autenticados.</li>
            </ul>
          </article>
          <article>
            <h2>Cómo se organiza</h2>
            <ul className="public-list">
              <li>Capas separadas de frontend, API y base de datos PostgreSQL.</li>
              <li>Clasificación geológica y taxonómica vinculada por fósil.</li>
              <li>Control de acceso por rol para proteger información sensible.</li>
              <li>Flujo de aprobación para registros y estudios científicos.</li>
            </ul>
          </article>
        </div>
        <div className="public-page-actions public-page-actions--contact-cta">
          <Link to="/catalog" className="public-btn public-btn--contact-catalog">
            Ver catálogo
          </Link>
          <Link to="/contact" className="public-btn public-btn--contact-outline">
            Contactar al equipo
          </Link>
        </div>
      </section>
    </main>
  );
}
