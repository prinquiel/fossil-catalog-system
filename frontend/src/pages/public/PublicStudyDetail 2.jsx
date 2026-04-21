import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import FossilCodeCopy from '../../components/fossil/FossilCodeCopy.jsx';
import PublicStudyContent from '../../components/study/PublicStudyContent.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';
import './Catalog.css';
import './PublicStudiesPages.css';

export default function PublicStudyDetail() {
  const { user } = useAuth();
  const showFossilCode = canViewFossilCode(user);
  const { id } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let m = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await studyService.getPublicById(id);
        if (!m) return;
        if (res?.success && res.data) {
          setStudy(res.data);
        } else {
          setStudy(null);
          setError(res?.error || 'Estudio no encontrado.');
        }
      } catch (e) {
        if (m) {
          setStudy(null);
          setError(getApiErrorMessage(e));
        }
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [id]);

  return (
    <main className="catalog-shell public-study-detail-page">
      <SiteHeader />

      {loading && <p className="catalog-studies-hint">Cargando estudio…</p>}

      {!loading && (error || !study) && (
        <>
          <header className="catalog-hero" style={{ paddingBottom: 12 }}>
            <h1 style={{ marginTop: 8 }}>Estudio no disponible</h1>
            <p className="catalog-subtitle">{error || 'No existe o no está publicado.'}</p>
            <Link className="catalog-btn ghost" to="/catalog/estudios">
              Ver todos los estudios
            </Link>
          </header>
        </>
      )}

      {!loading && study && (
        <>
          <header className="catalog-hero public-study-detail__hero">
            <p className="catalog-kicker">Estudio científico</p>
            <h1>{study.title || 'Sin título'}</h1>
            <p className="catalog-subtitle public-study-detail__subtitle">
              {showFossilCode && study.fossil_unique_code ? (
                <>
                  Ejemplar <FossilCodeCopy code={study.fossil_unique_code} variant="map" />
                  {study.fossil_name ? ` · ${study.fossil_name}` : ''}
                  {study.study_date ? ` · Fecha: ${String(study.study_date).slice(0, 10)}` : ''}
                </>
              ) : (
                <>
                  {[
                    study.fossil_name,
                    study.study_date ? `Fecha: ${String(study.study_date).slice(0, 10)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Ficha completa'}
                </>
              )}
            </p>
            <div className="catalog-hero-actions">
              <Link className="catalog-btn ghost" to="/catalog/estudios">
                Todos los estudios
              </Link>
              <Link className="catalog-btn solid" to={`/catalog#fossil-${study.fossil_id}`}>
                Ver hallazgo en catálogo
              </Link>
            </div>
          </header>

          <div className="public-study-detail__body">
            <PublicStudyContent study={study} />
          </div>
        </>
      )}
    </main>
  );
}
