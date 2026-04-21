import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_CATEGORIES, FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import FossilMiniMap from '../../components/maps/FossilMiniMap.jsx';
import FossilMediaGallery from '../../components/fossil/FossilMediaGallery.jsx';
import { hasValidCoords, normalizeGeoPoint } from '../../utils/geoNormalize.js';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { WorkspaceBackNav } from '../../components/workspace/WorkspaceBackNav.jsx';
import '../workspace/workspace-pages.css';
import './researcher-pages.css';

function ResearcherFossilDetail() {
  const { res } = useWorkspaceNav();
  const { id } = useParams();
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getById(id);
        if (!mounted) return;
        if (res.success && res.data) setF(res.data);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const cat = FOSSIL_CATEGORIES.find((c) => c.value === f?.category)?.label || f?.category;
  const normalized = f ? normalizeGeoPoint(f) : null;
  const hasCoords = hasValidCoords(f);

  if (loading) {
    return (
      <div className="workspace-page">
        <WorkspaceBackNav />
        <p className="workspace-muted">Cargando ficha…</p>
      </div>
    );
  }

  if (!f) {
    return (
      <div className="workspace-page">
        <WorkspaceBackNav />
        <div className="workspace-alert">No se encontró el registro solicitado.</div>
        <Link to={res('/catalog')} className="workspace-link">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="workspace-page rw-animate-in">
      <WorkspaceBackNav />
      <p className="workspace-page__kicker">Detalle de ejemplar</p>
      <h1 className="workspace-page__title">{f.name}</h1>
      <p className="workspace-page__lead">
        {f.unique_code} · {FOSSIL_STATUS_LABELS[f.status] || f.status} · {cat}
      </p>

      <div className="researcher-detail">
        <div className="workspace-card researcher-detail__panel">
          <p style={{ marginTop: 0 }}>{f.description || 'Sin descripción.'}</p>
          <dl className="researcher-detail__dl">
            <div>
              <dt>Contexto geológico</dt>
              <dd>{f.geological_context || '—'}</dd>
            </div>
            <div>
              <dt>Era geológica</dt>
              <dd>{f.era_name || '—'}</dd>
            </div>
            <div>
              <dt>Período geológico</dt>
              <dd>{f.period_name || '—'}</dd>
            </div>
            <div>
              <dt>Clasificación taxonómica</dt>
              <dd>
                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                  <li>Reino: {f.kingdom_name || '—'}</li>
                  <li>Filo: {f.phylum_name || '—'}</li>
                  <li>Clase: {f.class_name || '—'}</li>
                  <li>Orden: {f.order_name || '—'}</li>
                  <li>Familia: {f.family_name || '—'}</li>
                  <li>Género: {f.genus_name || '—'}</li>
                  <li>Especie: {f.species_name || '—'}</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt>Coordenadas</dt>
              <dd>
                {hasCoords
                  ? `${Number(normalized?.latitude).toFixed(6)}, ${Number(normalized?.longitude).toFixed(6)}`
                  : 'Sin coordenadas en esta ficha.'}
              </dd>
            </div>
            {f.location_description ? (
              <div>
                <dt>Lugar</dt>
                <dd>{f.location_description}</dd>
              </div>
            ) : null}
          </dl>
          <FossilMediaGallery fossilId={f.id} title="Fotografías" />
          <div className="researcher-detail__actions">
            <Link to={res(`/create-study/${f.id}`)} className="workspace-btn">
              Registrar estudio
            </Link>
            <Link to={res('/catalog')} className="workspace-btn workspace-btn--ghost">
              Volver al catálogo
            </Link>
          </div>
        </div>

        {hasCoords ? (
          <div className="researcher-detail__panel researcher-detail__panel--secondary">
            <p className="workspace-page__kicker" style={{ marginTop: 0 }}>
              Mapa del registro
            </p>
            <h2 className="workspace-page__title" style={{ fontSize: '1.25rem', marginBottom: 12 }}>
              Ubicación aproximada
            </h2>
            <FossilMiniMap
              latitude={normalized?.latitude}
              longitude={normalized?.longitude}
              countryCode={f.country_code}
              provinceCode={f.province_code}
              cantonCode={f.canton_code}
              title={f.name}
              subtitle={f.unique_code}
            />
            <p className="researcher-detail__map-caption">
              <Link to={res('/map')} className="workspace-link">
                Mapa
              </Link>{' '} general de todos los hallazgos.
            </p>
          </div>
        ) : (
          <div className="workspace-card researcher-detail__panel researcher-detail__panel--secondary workspace-muted">
            <p style={{ margin: 0 }}>
              Esta ficha no tiene coordenadas; no se puede mostrar un mapa puntual. Consultá el{' '}
              <Link to={res('/map')} className="workspace-link">
                mapa general
              </Link>{' '}
              para otros ejemplares georreferenciados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearcherFossilDetail;
