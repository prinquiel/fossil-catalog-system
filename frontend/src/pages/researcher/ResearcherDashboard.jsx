import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';

function ResearcherDashboard() {
  const { user } = useAuth();
  const [fossils, setFossils] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fRes, sRes] = await Promise.all([fossilService.getAll(), studyService.getAll()]);
        if (!mounted) return;
        setFossils(Array.isArray(fRes?.data) ? fRes.data : []);
        setStudies(Array.isArray(sRes?.data) ? sRes.data : []);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const published = useMemo(() => fossils.filter((x) => x.status === 'published').length, [fossils]);
  const myStudies = useMemo(
    () => studies.filter((s) => String(s.researcher_id) === String(user?.id)),
    [studies, user?.id]
  );

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Mesa de trabajo</p>
      <h1 className="workspace-page__title">Panel del investigador</h1>
      <p className="workspace-page__lead">
        Panorama del catálogo publicado y de sus estudios científicos asociados a ejemplares del archivo.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : (
        <div className="workspace-grid-2">
          <article className="workspace-stat">
            <strong>{published}</strong>
            <span>Fichas publicadas en catálogo</span>
          </article>
          <article className="workspace-stat">
            <strong>{fossils.length}</strong>
            <span>Total de registros (todos los estados)</span>
          </article>
          <article className="workspace-stat">
            <strong>{myStudies.length}</strong>
            <span>Mis estudios registrados</span>
          </article>
        </div>
      )}

      <div className="workspace-card" style={{ marginTop: 22 }}>
        <p className="workspace-page__kicker" style={{ marginBottom: 10 }}>
          Accesos
        </p>
        <div className="workspace-actions">
          <Link to="/researcher/catalog" className="workspace-btn">
            Catálogo de trabajo
          </Link>
          <Link to="/researcher/search" className="workspace-btn workspace-btn--ghost">
            Búsqueda rápida
          </Link>
          <Link to="/researcher/map" className="workspace-btn workspace-btn--ghost">
            Mapa de coordenadas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResearcherDashboard;
