import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';
import './researcher-dashboard.css';

function ResearcherDashboard() {
  const { user } = useAuth();
  const [fossils, setFossils] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const quickActions = [
    { to: '/researcher/catalog', label: 'Catalogo', hint: 'Fichas publicadas' },
    { to: '/researcher/search', label: 'Buscar', hint: 'Consulta directa' },
    { to: '/researcher/my-studies', label: 'Estudios', hint: 'Gestion personal' },
    { to: '/researcher/map', label: 'Mapa', hint: 'Vista espacial' },
  ];

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
      <div className="researcher-dash-hero">
        <p className="workspace-page__kicker">Mesa de trabajo</p>
        <h1 className="workspace-page__title" style={{ border: 0, paddingBottom: 8, marginBottom: 0 }}>
          Panel del investigador
        </h1>
        <p className="workspace-page__lead" style={{ marginBottom: 0 }}>
          Espacio profesional para analizar hallazgos publicados, registrar estudios y navegar evidencias visuales y
          geográficas en un solo flujo.
        </p>

        {loading ? (
          <p className="workspace-muted" style={{ marginTop: 16 }}>
            Cargando…
          </p>
        ) : (
          <div className="researcher-dash-stats">
            <div className="researcher-dash-stat">
              <strong>{published}</strong>
              <span>Fichas publicadas en catálogo</span>
            </div>
            <div className="researcher-dash-stat">
              <strong>{fossils.length}</strong>
              <span>Registros cargados en la base</span>
            </div>
            <div className="researcher-dash-stat">
              <strong>{myStudies.length}</strong>
              <span>Mis estudios registrados</span>
            </div>
          </div>
        )}
      </div>

      <div className="researcher-dash-accesos">
        <div className="researcher-dash-quickbar-head">
          <p className="workspace-page__kicker">Acceso rapido</p>
          <span>Atajos directos del panel</span>
        </div>
        <div className="researcher-dash-quickbar" role="navigation" aria-label="Accesos rapidos de investigador">
          {quickActions.map((item) => (
            <Link key={item.to} to={item.to} className="researcher-dash-quickbar-item">
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResearcherDashboard;
