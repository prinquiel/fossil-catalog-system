import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { statsService } from '../../services/statsService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminStats() {
  const [overview, setOverview] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byRole, setByRole] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFatalError(null);
    try {
      const [o, f, u, c, t] = await Promise.all([
        statsService.overview(),
        statsService.fossils(),
        statsService.users(),
        statsService.categories(),
        statsService.timeline(),
      ]);
      if (o.success) setOverview(o.data);
      else setOverview(null);
      if (f.success) setByStatus(f.data || []);
      else setByStatus([]);
      if (u.success) setByRole(u.data || []);
      else setByRole([]);
      if (c.success) setByCategory(c.data || []);
      else setByCategory([]);
      if (t.success) setTimeline(t.data || []);
      else setTimeline([]);
      if (!o.success) {
        setFatalError(typeof o.error === 'string' ? o.error : 'No se pudo cargar el resumen');
      }
    } catch (e) {
      const msg = getApiErrorMessage(e);
      setFatalError(msg);
      toast.error(msg);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Indicadores</p>
        <h1 className="admin-page-title">Estadísticas</h1>
        <p className="admin-page-desc">
          Resumen numérico del archivo y de la actividad registrada. Los datos provienen directamente de la
          base de datos vía API de estadísticas.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && fatalError && (
        <div className="admin-panel" style={{ marginTop: 8 }}>
          <p className="admin-page-desc">{fatalError}</p>
          <p className="admin-page-desc" style={{ fontSize: '0.88rem' }}>
            Si el mensaje indica falta de permisos, cerrá sesión y volvé a entrar con una cuenta que tenga rol
            de administrador en la base de datos.
          </p>
          <button type="button" className="admin-btn admin-btn--primary" style={{ marginTop: 10 }} onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && overview && (
        <div className="admin-card-grid">
          <article className="admin-stat-card admin-stat-card--accent">
            <div className="admin-stat-card__value">{overview.fossils}</div>
            <div className="admin-stat-card__label">Fósiles activos</div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-card__value">{overview.users}</div>
            <div className="admin-stat-card__label">Usuarios</div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-card__value">{overview.studies}</div>
            <div className="admin-stat-card__label">Estudios científicos</div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-card__value">{overview.media}</div>
            <div className="admin-stat-card__label">Archivos multimedia</div>
          </article>
        </div>
      )}

      {!loading && (
        <div
          style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <div className="admin-panel">
            <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
              Fósiles por estado
            </h2>
            {byStatus.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }} className="admin-page-desc">
                {byStatus.map((row) => (
                  <li key={row.status}>
                    <strong>{row.status}</strong>: {row.total}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="admin-panel">
            <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
              Usuarios por rol
            </h2>
            {byRole.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }} className="admin-page-desc">
                {byRole.map((row) => (
                  <li key={row.role}>
                    <strong>{row.role}</strong>: {row.total}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="admin-panel">
            <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
              Por categoría
            </h2>
            {byCategory.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }} className="admin-page-desc">
                {byCategory.map((row) => (
                  <li key={row.category}>
                    <strong>{row.category}</strong>: {row.total}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!loading && timeline.length > 0 && (
        <div className="admin-panel" style={{ marginTop: 24 }}>
          <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
            Altas de fósiles por mes
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Registros</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((row) => (
                  <tr key={String(row.month)}>
                    <td>
                      {row.month
                        ? new Date(row.month).toLocaleDateString('es-CR', { year: 'numeric', month: 'long' })
                        : '—'}
                    </td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminStats;
