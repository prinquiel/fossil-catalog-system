import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminPendingFossils() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(/** @type {{ id: number; name: string; code: string } | null} */ (null));
  const [rejecting, setRejecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fossilService.getPending();
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

  const approve = async (id) => {
    try {
      await fossilService.approve(id);
      toast.success('Fósil publicado.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const closeRejectDialog = () => {
    if (!rejecting) setRejectTarget(null);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await fossilService.reject(rejectTarget.id);
      toast.success('Registro rechazado.');
      setRejectTarget(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setRejecting(false);
    }
  };

  return (
    <>
      <AdminConfirmDialog
        open={Boolean(rejectTarget)}
        title="Rechazar fósil"
        confirmLabel="Rechazar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        loading={rejecting}
        onCancel={closeRejectDialog}
        onConfirm={confirmReject}
      >
        <p style={{ margin: 0 }}>
          ¿Rechazar este registro? Dejará de estar en revisión y el explorador verá el estado rechazado.
        </p>
        {rejectTarget ? (
          <p style={{ margin: '12px 0 0' }}>
            <strong>{rejectTarget.name}</strong>
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.9rem', opacity: 0.85 }}>
              {rejectTarget.code}
            </span>
          </p>
        ) : null}
      </AdminConfirmDialog>

      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Curación</p>
        <h1 className="admin-page-title">Fósiles pendientes</h1>
        <p className="admin-page-desc">
          Registros enviados por exploradores que aún no están publicados. Apruebe para que aparezcan en el
          catálogo público o rechace si no cumplen criterios.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && rows.length === 0 && (
        <div className="admin-panel admin-empty">No hay fósiles en revisión en este momento.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <td>{f.unique_code}</td>
                  <td>{f.name}</td>
                  <td>{f.category}</td>
                  <td>{f.created_by_username || f.created_by}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => approve(f.id)}
                      >
                        Publicar
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() =>
                          setRejectTarget({
                            id: f.id,
                            name: f.name || 'Sin nombre',
                            code: f.unique_code || '',
                          })
                        }
                      >
                        Rechazar
                      </button>
                      <Link
                        to={`/admin/fossil/${f.id}/review`}
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Detalle
                      </Link>
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

export default AdminPendingFossils;
