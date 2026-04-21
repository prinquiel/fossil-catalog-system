import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import FossilMediaGallery from '../../components/fossil/FossilMediaGallery.jsx';
import FossilMiniMap from '../../components/maps/FossilMiniMap.jsx';
import FossilCodeCopy from '../../components/fossil/FossilCodeCopy.jsx';
import { fossilService } from '../../services/fossilService.js';
import { hasValidCoords, normalizeGeoPoint } from '../../utils/geoNormalize.js';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './public-info-pages.css';

const categoryLabels = {
  FOS: 'Fósil',
  MIN: 'Mineral',
  ROC: 'Roca',
  PAL: 'Paleontológico',
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function TaxonomyRow({ label, value }) {
  return (
    <li>
      <strong>{label}:</strong> {value || '—'}
    </li>
  );
}

export default function PublicFossilDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [fossil, setFossil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const normalized = useMemo(() => (fossil ? normalizeGeoPoint(fossil) : null), [fossil]);
  const showCode = canViewFossilCode(user);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fossilService.getById(id);
        if (!mounted) return;
        const row = res?.success ? res.data : null;
        if (!row || row.status !== 'published') {
          setFossil(null);
          setError('No se encontró un fósil público con ese identificador.');
          return;
        }
        setFossil(row);
      } catch {
        if (!mounted) return;
        setFossil(null);
        setError('No se pudo cargar la ficha solicitada. Intente de nuevo en unos segundos.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <main className="public-page-shell">
      <SiteHeader />
      <section className="public-card">
        <p className="public-page-kicker">Detalle público</p>
        <h1 className="public-page-title">Ficha de hallazgo</h1>
        <p className="public-page-lead">
          Vista compartible de un ejemplar publicado en el museo digital.
        </p>
      </section>

      {loading ? (
        <section className="public-card">
          <div className="public-skeleton" />
          <div className="public-skeleton" />
          <div className="public-skeleton" />
        </section>
      ) : null}

      {!loading && error ? (
        <section className="public-card">
          <p className="public-page-error">{error}</p>
          <div className="public-page-actions">
            <Link to="/catalog" className="public-btn">
              Volver al catálogo
            </Link>
          </div>
        </section>
      ) : null}

      {!loading && fossil ? (
        <section className="public-card public-card--detail">
          <div className="public-page-detail-head">
            <p className="public-page-kicker">Registro publicado</p>
            <h2>{fossil.name || 'Sin nombre'}</h2>
            <p>
              {categoryLabels[fossil.category] || fossil.category || 'Sin categoría'}
              {' · '}
              {formatDate(fossil.discovery_date)}
            </p>
            {showCode && fossil.unique_code ? (
              <div style={{ marginTop: 8 }}>
                <FossilCodeCopy code={fossil.unique_code} variant="detail" />
              </div>
            ) : null}
          </div>

          <p className="public-page-copy">{fossil.description || 'Sin descripción disponible.'}</p>

          <div className="public-grid-two">
            <article>
              <h3>Información geológica</h3>
              <dl className="public-dl">
                <div>
                  <dt>Contexto geológico</dt>
                  <dd>{fossil.geological_context || 'Sin contexto registrado'}</dd>
                </div>
                <div>
                  <dt>Era</dt>
                  <dd>{fossil.era_name || '—'}</dd>
                </div>
                <div>
                  <dt>Período</dt>
                  <dd>{fossil.period_name || '—'}</dd>
                </div>
                <div>
                  <dt>Estado original</dt>
                  <dd>{fossil.original_state_description || '—'}</dd>
                </div>
              </dl>
            </article>

            <article>
              <h3>Clasificación taxonómica</h3>
              <ul className="public-taxonomy-list">
                <TaxonomyRow label="Reino" value={fossil.kingdom_name} />
                <TaxonomyRow label="Filo" value={fossil.phylum_name} />
                <TaxonomyRow label="Clase" value={fossil.class_name} />
                <TaxonomyRow label="Orden" value={fossil.order_name} />
                <TaxonomyRow label="Familia" value={fossil.family_name} />
                <TaxonomyRow label="Género" value={fossil.genus_name} />
                <TaxonomyRow label="Especie" value={fossil.species_name} />
              </ul>
            </article>
          </div>

          <FossilMediaGallery fossilId={fossil.id} />

          {hasValidCoords(fossil) ? (
            <section className="public-map-wrap">
              <h3>Ubicación del hallazgo</h3>
              <FossilMiniMap
                latitude={normalized?.latitude}
                longitude={normalized?.longitude}
                countryCode={fossil.country_code}
                provinceCode={fossil.province_code}
                cantonCode={fossil.canton_code}
                title={fossil.name}
                subtitle={showCode ? fossil.unique_code : undefined}
              />
            </section>
          ) : (
            <p className="public-page-muted">Este registro no tiene coordenadas públicas asociadas.</p>
          )}

          <div className="public-page-actions">
            <Link to="/catalog" className="public-btn">
              Volver al catálogo
            </Link>
            <Link to="/map" className="public-btn public-btn--ghost">
              Ver mapa público
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
