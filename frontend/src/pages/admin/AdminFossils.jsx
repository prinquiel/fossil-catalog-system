import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

const STATUS = { pending: 'En revisión', published: 'Publicado', rejected: 'Rechazado' };
const CAT = { FOS: 'Fósil', MIN: 'Mineral', ROC: 'Roca', PAL: 'Paleontológico' };

function AdminFossils() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fossilService.getAll();
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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Marcar este fósil como eliminado (soft delete)?')) return;
    try {
      await fossilService.delete(id);
      toast.success('Registro eliminado del catálogo activo.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Catálogo</p>
        <h1 className="admin-page-title">Fósiles</h1>
        <p className="admin-page-desc">
          Listado completo del archivo (todos los estados). Los registros en revisión pueden aprobarse desde
          «Fósiles pendientes».
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && rows.length === 0 && <div className="admin-panel admin-empty">No hay registros.</div>}

      {!loading && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Autor (id)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <td>{f.unique_code}</td>
                  <td>{f.name}</td>
                  <td>{CAT[f.category] || f.category}</td>
                  <td>{STATUS[f.status] || f.status}</td>
                  <td>{f.created_by}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {f.status === 'pending' && (
                        <Link
                          className="admin-btn admin-btn--ghost"
                          to={`/admin/fossil/${f.id}/review`}
                          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        >
                          Revisar
                        </Link>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => handleDelete(f.id)}
                      >
                        Eliminar
                      </button>
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

export default AdminFossils;
