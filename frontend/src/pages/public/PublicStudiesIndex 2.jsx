import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { studyService } from '../../services/studyService';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import '../workspace/workspace-pages.css';
import './Catalog.css';
import './PublicStudiesPages.css';

export default function PublicStudiesIndex() {
  const { user } = useAuth();
  const showFossilCode = canViewFossilCode(user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let m = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await studyService.getPublicCatalog();
        if (!m) return;
        if (res?.success && Array.isArray(res.data)) {
          setRows(res.data);
        } else {
          setRows([]);
          setError(res?.error || 'No se pudo cargar el listado.');
        }
      } catch {
        if (m) {
          setRows([]);
          setError('Error de conexión.');
        }
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, []);

  return (
    <main className="catalog-shell public-studies-page">
      <SiteHeader />

      <header className="catalog-hero public-studies-hero">
        <p className="catalog-kicker">Ciencia abierta</p>
        <h1>Estudios científicos</h1>
        <p className="catalog-subtitle">
          Trabajos publicados vinculados a ejemplares del archivo. Elija una tarjeta para abrir la ficha completa.
        </p>
      </header>

      {loading && (
        <section className="catalog-loading" aria-hidden="true">
          <div />
          <div />
          <div />
        </section>
      )}

      {!loading && error && <p className="catalog-notice">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="public-studies-empty">Aún no hay estudios publicados en el catálogo.</p>
      )}

      {!loading && rows.length > 0 && (
        <section className="public-studies-grid" aria-label="Estudios publicados">
          {rows.map((s) => (
            <Link key={s.id} to={`/catalog/estudio/${s.id}`} className="public-studies-card">
              <div className="public-studies-card__accent" aria-hidden="true" />
              <div className="public-studies-card__body">
                <h2 className="public-studies-card__title">{s.title || 'Estudio sin título'}</h2>
                <div className="public-studies-card__fossil-row">
                  {showFossilCode && s.fossil_unique_code ? (
                    <span className="public-studies-card__code">{s.fossil_unique_code}</span>
                  ) : null}
                  {s.fossil_name ? (
                    <span className="public-studies-card__fossil-name">{s.fossil_name}</span>
                  ) : null}
                </div>
                {s.study_date ? (
                  <time className="public-studies-card__date" dateTime={String(s.study_date).slice(0, 10)}>
                    {String(s.study_date).slice(0, 10)}
                  </time>
                ) : null}
              </div>
              <span className="public-studies-card__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
