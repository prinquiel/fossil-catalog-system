import { Link } from 'react-router-dom';
import './PlaceholderPage.css';

const defaultDescription =
  'Esta sección no está disponible en esta versión o aún está en preparación. Puede volver al inicio o al catálogo público.';

function PlaceholderPage({
  title,
  description,
  eyebrow = 'Información',
  className = '',
  showWorkspaceHints = true,
}) {
  const text = description || defaultDescription;

  return (
    <article className={`placeholder-card ${className}`.trim()}>
      <p className="placeholder-card__eyebrow">{eyebrow}</p>
      <h1 className="placeholder-card__title">{title}</h1>
      <p className="placeholder-card__text">{text}</p>
      {showWorkspaceHints ? (
        <div className="placeholder-card__actions">
          <Link to="/catalog" className="placeholder-card__link">
            Ir al catálogo
          </Link>
          <Link to="/" className="placeholder-card__link placeholder-card__link--secondary">
            Página de inicio
          </Link>
        </div>
      ) : null}
    </article>
  );
}

export default PlaceholderPage;
