import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auditService } from '../../services/auditService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

function AdminAudit() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditService.list();
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

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Trazabilidad</p>
        <h1 className="admin-page-title">Auditoría</h1>
        <p className="admin-page-desc">
          Últimos movimientos registrados en el sistema (hasta 500 entradas). Si la tabla está vacía, aún no
          se han generado eventos de auditoría desde el backend.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && rows.length === 0 && (
        <div className="admin-panel admin-empty">
          No hay registros de auditoría. Los eventos aparecerán cuando el backend los escriba en{' '}
          <code>audit_logs</code>.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Tabla</th>
                <th>Registro</th>
                <th>Usuario</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString('es-CR') : '—'}</td>
                  <td>{r.action}</td>
                  <td>{r.table_name || '—'}</td>
                  <td>{r.record_id ?? '—'}</td>
                  <td>{r.user_id ?? '—'}</td>
                  <td>{r.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminAudit;
