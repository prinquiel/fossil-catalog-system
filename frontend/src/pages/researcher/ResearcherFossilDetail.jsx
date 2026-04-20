import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_CATEGORIES, FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import '../workspace/workspace-pages.css';

function ResearcherFossilDetail() {
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

  if (loading) {
    return (
      <div className="workspace-page">
        <p className="workspace-muted">Cargando ficha…</p>
      </div>
    );
  }

  if (!f) {
    return (
      <div className="workspace-page">
        <div className="workspace-alert">No se encontró el registro solicitado.</div>
        <Link to="/researcher/catalog" className="workspace-link">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Detalle de ejemplar</p>
      <h1 className="workspace-page__title">{f.name}</h1>
      <p className="workspace-page__lead">
        {f.unique_code} · {FOSSIL_STATUS_LABELS[f.status] || f.status} · {cat}
      </p>

      <div className="workspace-card">
        <p>{f.description || 'Sin descripción.'}</p>
        <dl style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <dt className="workspace-muted">Contexto geológico</dt>
            <dd style={{ margin: 0 }}>{f.geological_context || '—'}</dd>
          </div>
          <div style={{ marginBottom: 8 }}>
            <dt className="workspace-muted">Coordenadas</dt>
            <dd style={{ margin: 0 }}>
              {f.latitude != null && f.longitude != null
                ? `${f.latitude}, ${f.longitude}`
                : 'Sin coordenadas en esta ficha.'}
            </dd>
          </div>
        </dl>
        <div className="workspace-actions">
          <Link to={`/researcher/create-study/${f.id}`} className="workspace-btn">
            Registrar estudio
          </Link>
          <Link to="/researcher/catalog" className="workspace-btn workspace-btn--ghost">
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResearcherFossilDetail;
