import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminPendingFossils() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const reject = async (id) => {
    if (!window.confirm('¿Rechazar este registro?')) return;
    try {
      await fossilService.reject(id);
      toast.success('Registro rechazado.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <>
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
                        onClick={() => reject(f.id)}
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
