import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { statsService } from '../../services/statsService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';
import './admin-stats.css';

const DONUT_COLORS = ['#8b1532', '#c4b39a', '#6b5844', '#b08968', '#3d3428'];

function StatusDonut({ rows }) {
  const total = useMemo(() => rows.reduce((s, r) => s + (r.total || 0), 0), [rows]);
  const style = useMemo(() => {
    if (total === 0) return { background: '#e8e0d4' };
    let acc = 0;
    const parts = rows.map((r, i) => {
      const pct = ((r.total || 0) / total) * 100;
      const start = acc;
      acc += pct;
      return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${acc}%`;
    });
    return { background: `conic-gradient(${parts.join(', ')})` };
  }, [rows, total]);

  return (
    <div
      className="admin-stats-donut"
      style={style}
      role="img"
      aria-label="Distribución de fósiles por estado"
    />
  );
}

function AdminStats() {
  const [overview, setOverview] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [byRole, setByRole] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState(null);

  const maxStatus = useMemo(() => Math.max(0, ...byStatus.map((r) => r.total || 0), 1), [byStatus]);
  const maxCat = useMemo(() => Math.max(0, ...byCategory.map((r) => r.total || 0), 1), [byCategory]);
  const maxTimeline = useMemo(() => Math.max(0, ...timeline.map((r) => r.total || 0), 1), [timeline]);

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
    <div className="admin-stats-page">
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Indicadores</p>
        <h1 className="admin-page-title">Estadísticas</h1>
        <p className="admin-page-desc">
          Vista consolidada del archivo: KPIs, distribuciones, roles y tendencia de altas mensuales. Los datos provienen
          de la API de estadísticas en tiempo real.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && fatalError && (
        <div className="admin-panel" style={{ marginTop: 8 }}>
          <p className="admin-page-desc">{fatalError}</p>
          <p className="admin-page-desc" style={{ fontSize: '0.88rem' }}>
            Si el mensaje indica falta de permisos, cerrá sesión y volvé a entrar con una cuenta administradora.
          </p>
          <button type="button" className="admin-btn admin-btn--primary" style={{ marginTop: 10 }} onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && overview && (
        <section className="admin-stats-kpis" aria-label="Indicadores principales">
          <article className="admin-stats-kpi admin-stats-kpi--accent">
            <div className="admin-stats-kpi__value">{overview.fossils}</div>
            <div className="admin-stats-kpi__label">Fósiles activos</div>
          </article>
          <article className="admin-stats-kpi">
            <div className="admin-stats-kpi__value">{overview.users}</div>
            <div className="admin-stats-kpi__label">Usuarios</div>
          </article>
          <article className="admin-stats-kpi">
            <div className="admin-stats-kpi__value">{overview.studies}</div>
            <div className="admin-stats-kpi__label">Estudios científicos</div>
          </article>
          <article className="admin-stats-kpi">
            <div className="admin-stats-kpi__value">{overview.media}</div>
            <div className="admin-stats-kpi__label">Archivos multimedia</div>
          </article>
        </section>
      )}

      {!loading && (
        <section className="admin-stats-grid">
          <div className="admin-stats-panel">
            <h2 className="admin-stats-panel__title">Fósiles por estado</h2>
            {byStatus.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              <>
                <div className="admin-stats-donut-wrap">
                  <StatusDonut rows={byStatus} />
                  <ul className="admin-stats-legend">
                    {byStatus.map((row, i) => (
                      <li key={row.status}>
                        <span style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} aria-hidden />
                        <span>
                          <strong>{row.status}</strong> — {row.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {byStatus.map((row) => (
                  <div key={row.status} className="admin-stats-bar-row">
                    <span className="admin-stats-bar-label">{row.status}</span>
                    <div className="admin-stats-bar-track">
                      <div
                        className="admin-stats-bar-fill"
                        style={{ width: `${(row.total / maxStatus) * 100}%` }}
                      />
                    </div>
                    <span className="admin-stats-bar-num">{row.total}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="admin-stats-panel">
            <h2 className="admin-stats-panel__title">Usuarios por rol</h2>
            {byRole.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              <div className="admin-stats-table-wrap">
                <table className="admin-stats-table">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byRole.map((row) => (
                      <tr key={row.role}>
                        <td>{row.role}</td>
                        <td>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-stats-panel">
            <h2 className="admin-stats-panel__title">Fósiles por categoría</h2>
            {byCategory.length === 0 ? (
              <p className="admin-page-desc">Sin datos.</p>
            ) : (
              byCategory.map((row) => (
                <div key={row.category} className="admin-stats-bar-row">
                  <span className="admin-stats-bar-label">{row.category}</span>
                  <div className="admin-stats-bar-track">
                    <div
                      className="admin-stats-bar-fill"
                      style={{
                        width: `${(row.total / maxCat) * 100}%`,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="admin-stats-bar-num">{row.total}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {!loading && timeline.length > 0 && (
        <div className="admin-stats-panel" style={{ marginTop: 8 }}>
          <h2 className="admin-stats-panel__title">Altas de fósiles por mes (tendencia)</h2>
          <div className="admin-stats-timeline-chart" role="img" aria-label="Gráfico de barras mensual">
            {timeline.map((row) => (
              <div
                key={String(row.month)}
                className="admin-stats-timeline-bar"
                style={{
                  height: `${Math.max(12, (row.total / maxTimeline) * 140)}px`,
                }}
                title={`${row.total} registros`}
              />
            ))}
          </div>
          <div className="admin-stats-timeline-labels">
            {timeline.map((row) => (
              <span key={String(row.month)}>
                {row.month
                  ? new Date(row.month).toLocaleDateString('es-CR', { month: 'short', year: '2-digit' })
                  : '—'}
              </span>
            ))}
          </div>
          <div className="admin-table-wrap" style={{ marginTop: 16 }}>
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
    </div>
  );
}

export default AdminStats;
