import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import './adminPages.css';

function AdminPendingStudies() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studyService.getAdminPending();
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

  const publish = async (id) => {
    try {
      const res = await studyService.publish(id);
      if (res.success) {
        toast.success('Estudio publicado en el catálogo público.');
        load();
      } else {
        toast.error(res.error || 'No se pudo publicar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const confirmReject = async () => {
    if (rejectingId == null) return;
    try {
      const res = await studyService.reject(rejectingId, rejectReason.trim() || null);
      if (res.success) {
        toast.success('Estudio rechazado. El investigador puede ver el motivo en su ficha.');
        setRejectingId(null);
        setRejectReason('');
        load();
      } else {
        toast.error(res.error || 'No se pudo rechazar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Curación</p>
        <h1 className="admin-page-title">Estudios pendientes</h1>
        <p className="admin-page-desc">
          Los investigadores vinculan estudios a ejemplares ya publicados. Apruebe para que el contenido aparezca en el
          catálogo público, o rechace con un comentario breve para el autor.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && rows.length === 0 && (
        <div className="admin-panel admin-empty">No hay estudios en revisión en este momento.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Ejemplar</th>
                <th>Investigador</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>{s.title || 'Sin título'}</td>
                  <td>
                    {s.fossil_unique_code || '—'}
                    <br />
                    <span style={{ fontSize: '0.82rem', color: 'var(--earth-brown, #8a7356)' }}>
                      {s.fossil_name || `Fósil #${s.fossil_id}`}
                    </span>
                  </td>
                  <td>{s.researcher_username || '—'}</td>
                  <td>{s.created_at ? String(s.created_at).slice(0, 10) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => publish(s.id)}
                      >
                        Publicar
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => {
                          setRejectingId(s.id);
                          setRejectReason('');
                        }}
                      >
                        Rechazar
                      </button>
                      <Link
                        to={`/admin/study/${s.id}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Ver estudio
                      </Link>
                      <Link
                        to={`/catalog#fossil-${s.fossil_id}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver ficha pública
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectingId != null && (
        <div className="admin-panel" style={{ marginTop: 20, maxWidth: 520 }}>
          <p className="admin-page-desc" style={{ marginTop: 0, fontWeight: 700 }}>
            Motivo del rechazo (opcional)
          </p>
          <textarea
            className="admin-search"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ej.: Falta referencia bibliográfica obligatoria…"
            aria-label="Motivo del rechazo"
          />
          <div className="admin-actions-row" style={{ marginTop: 12 }}>
            <button type="button" className="admin-btn admin-btn--primary" onClick={confirmReject}>
              Confirmar rechazo
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => {
                setRejectingId(null);
                setRejectReason('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPendingStudies;
