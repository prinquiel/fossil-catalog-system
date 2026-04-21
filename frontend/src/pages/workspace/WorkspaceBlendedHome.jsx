import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspaceNav } from '../../context/WorkspaceNavContext.jsx';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import './workspace-pages.css';
import '../researcher/researcher-dashboard.css';

/**
 * Inicio unificado explorador + investigador (solo ruta /workspace/inicio).
 */
function WorkspaceBlendedHome() {
  const { user } = useAuth();
  const { exp, res } = useWorkspaceNav();
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

  const mineFossils = useMemo(
    () => fossils.filter((f) => String(f.created_by) === String(user?.id)),
    [fossils, user?.id]
  );
  const mineStudies = useMemo(
    () => studies.filter((s) => String(s.researcher_id) === String(user?.id)),
    [studies, user?.id]
  );

  const explorerStats = useMemo(() => {
    const published = mineFossils.filter((f) => f.status === 'published').length;
    const pending = mineFossils.filter((f) => f.status === 'pending').length;
    return { total: mineFossils.length, published, pending };
  }, [mineFossils]);

  const publishedCatalog = useMemo(() => fossils.filter((x) => x.status === 'published').length, [fossils]);

  return (
    <div className="workspace-page">
      <div className="researcher-dash-hero">
        <p className="workspace-page__kicker">Campo y mesa de trabajo</p>
        <h1 className="workspace-page__title" style={{ border: 0, paddingBottom: 8, marginBottom: 0 }}>
          Inicio
        </h1>
        <p className="workspace-page__lead" style={{ marginBottom: 0 }}>
          Resumen combinado de tus registros en campo y de tu actividad como investigador sobre el catálogo
          institucional.
        </p>
      </div>

      {loading ? (
        <p className="workspace-muted" style={{ marginTop: 16 }}>
          Cargando…
        </p>
      ) : (
        <>
          <div className="workspace-page__kicker" style={{ marginTop: 24, marginBottom: 8 }}>
            Explorador — hallazgos
          </div>
          <div className="workspace-grid-2">
            <article className="workspace-stat">
              <strong>{explorerStats.total}</strong>
              <span>Mis registros</span>
            </article>
            <article className="workspace-stat">
              <strong>{explorerStats.published}</strong>
              <span>{FOSSIL_STATUS_LABELS.published}</span>
            </article>
            <article className="workspace-stat">
              <strong>{explorerStats.pending}</strong>
              <span>{FOSSIL_STATUS_LABELS.pending}</span>
            </article>
          </div>

          <div className="workspace-page__kicker" style={{ marginTop: 28, marginBottom: 8 }}>
            Investigador — archivo
          </div>
          <div className="researcher-dash-stats">
            <div className="researcher-dash-stat">
              <strong>{publishedCatalog}</strong>
              <span>Fichas publicadas en catálogo</span>
            </div>
            <div className="researcher-dash-stat">
              <strong>{fossils.length}</strong>
              <span>Registros (todos)</span>
            </div>
            <div className="researcher-dash-stat">
              <strong>{mineStudies.length}</strong>
              <span>Mis estudios</span>
            </div>
          </div>

          <div className="researcher-dash-accesos" style={{ marginTop: 28 }}>
            <div className="researcher-dash-quickbar-head">
              <p className="workspace-page__kicker">Accesos rápidos</p>
              <span>Campo e investigación</span>
            </div>
            <div className="researcher-dash-quickbar" role="navigation" aria-label="Accesos inicio dual">
              <Link to="/workspace/nuevo-aporte" className="researcher-dash-quickbar-item">
                <strong>Nuevo aporte</strong>
                <small>Hallazgo o estudio</small>
              </Link>
              <Link to="/workspace/mis-aportes" className="researcher-dash-quickbar-item">
                <strong>Mis aportes</strong>
                <small>Registros y estudios</small>
              </Link>
              <Link to={exp('/create-fossil')} className="researcher-dash-quickbar-item">
                <strong>Nuevo hallazgo</strong>
                <small>Registrar en campo</small>
              </Link>
              <Link to={res('/catalog')} className="researcher-dash-quickbar-item">
                <strong>Catálogo</strong>
                <small>Fichas publicadas</small>
              </Link>
              <Link to={res('/search')} className="researcher-dash-quickbar-item">
                <strong>Buscar</strong>
                <small>Consulta al archivo</small>
              </Link>
              <Link to={res('/my-studies')} className="researcher-dash-quickbar-item">
                <strong>Mis estudios</strong>
                <small>Listado completo</small>
              </Link>
              <Link to={res('/map')} className="researcher-dash-quickbar-item">
                <strong>Mapa</strong>
                <small>Vista geográfica</small>
              </Link>
              <Link to={exp('/my-fossils')} className="researcher-dash-quickbar-item">
                <strong>Mis registros</strong>
                <small>Fichas de campo</small>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WorkspaceBlendedHome;
