import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { studyResearcherAccountLabel } from '../../utils/studyResearcherDisplay.js';
import './adminPages.css';

const STATUS = {
  pending: 'Pendiente',
  published: 'Publicado',
  rejected: 'Rechazado',
};

function AdminStudies() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studyService.getAll();
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter((row) => row.publication_status === statusFilter);
  }, [rows, statusFilter]);

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Catálogo científico</p>
        <h1 className="admin-page-title">Estudios</h1>
        <p className="admin-page-desc">
          Listado completo de estudios (pendientes, publicados y rechazados). Desde aquí puede abrir cada estudio y
          su ejemplar asociado.
        </p>
      </header>

      <section className="admin-toolbar" aria-label="Filtros de estudios">
        <div className="admin-filter-wrap" style={{ maxWidth: 240 }}>
          <label htmlFor="studies-status" className="admin-filter-label">
            Estado
          </label>
          <select
            id="studies-status"
            className="admin-search"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="published">Publicados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </section>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && filtered.length === 0 && <div className="admin-panel admin-empty">No hay estudios en esta vista.</div>}

      {!loading && filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Ejemplar</th>
                <th>Investigador</th>
                <th>Estado</th>
                <th>Alta</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.title || 'Sin título'}</td>
                  <td>
                    {s.fossil_unique_code || '—'}
                    <br />
                    <span style={{ fontSize: '0.82rem', color: 'var(--earth-brown, #8a7356)' }}>
                      {s.fossil_name || `Fósil #${s.fossil_id}`}
                    </span>
                  </td>
                  <td>{studyResearcherAccountLabel(s)}</td>
                  <td>{STATUS[s.publication_status] || s.publication_status || '—'}</td>
                  <td>{s.created_at ? String(s.created_at).slice(0, 10) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Link
                        to={`/admin/study/${s.id}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        Ver estudio
                      </Link>
                      {s.fossil_id ? (
                        <Link
                          to={`/admin/fossil/${s.fossil_id}/review`}
                          className="admin-btn admin-btn--ghost"
                          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        >
                          Ver ejemplar
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminStudies;
