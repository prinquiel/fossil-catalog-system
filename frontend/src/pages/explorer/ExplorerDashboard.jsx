import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_STATUS_LABELS } from '../../constants/fossilMeta.js';
import '../workspace/workspace-pages.css';

function ExplorerDashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getAll();
        if (!mounted) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        setRows(data);
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

  const mine = useMemo(() => rows.filter((f) => String(f.created_by) === String(user?.id)), [rows, user?.id]);

  const stats = useMemo(() => {
    const published = mine.filter((f) => f.status === 'published').length;
    const pending = mine.filter((f) => f.status === 'pending').length;
    return { total: mine.length, published, pending };
  }, [mine]);

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Resumen de campo</p>
      <h1 className="workspace-page__title">Panel del explorador</h1>
      <p className="workspace-page__lead">
        Aquí resume el estado de los hallazgos que has registrado. Los registros en revisión aparecen hasta
        que un administrador los publique o indique observaciones.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando datos del catálogo…</p>
      ) : (
        <div className="workspace-grid-2">
          <article className="workspace-stat">
            <strong>{stats.total}</strong>
            <span>Mis registros</span>
          </article>
          <article className="workspace-stat">
            <strong>{stats.published}</strong>
            <span>{FOSSIL_STATUS_LABELS.published}</span>
          </article>
          <article className="workspace-stat">
            <strong>{stats.pending}</strong>
            <span>{FOSSIL_STATUS_LABELS.pending}</span>
          </article>
        </div>
      )}

      <div className="workspace-card" style={{ marginTop: 22 }}>
        <p className="workspace-page__kicker" style={{ marginBottom: 10 }}>
          Acciones rápidas
        </p>
        <div className="workspace-actions">
          <Link to="/explorer/create-fossil" className="workspace-btn">
            Registrar hallazgo
          </Link>
          <Link to="/explorer/my-fossils" className="workspace-btn workspace-btn--ghost">
            Ver mis fichas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ExplorerDashboard;
