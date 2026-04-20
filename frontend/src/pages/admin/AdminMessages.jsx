import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contactService } from '../../services/contactService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

const STATUS_LABEL = {
  unread: 'Sin leer',
  read: 'Leído',
  replied: 'Respondido',
};

function AdminMessages() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactService.list();
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
        <p className="admin-page-eyebrow">Bandeja</p>
        <h1 className="admin-page-title">Mensajes de contacto</h1>
        <p className="admin-page-desc">
          Formularios recibidos desde el endpoint público de contacto. Abra cada fila para marcar como leído o
          eliminar.
        </p>
      </header>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && rows.length === 0 && (
        <div className="admin-panel admin-empty">No hay mensajes registrados.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Remitente</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleString('es-CR') : '—'}</td>
                  <td>
                    {m.name}
                    <br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>{m.email}</span>
                  </td>
                  <td>{m.subject}</td>
                  <td>{STATUS_LABEL[m.status] || m.status}</td>
                  <td>
                    <Link
                      to={`/admin/message/${m.id}`}
                      className="admin-btn admin-btn--ghost"
                      style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    >
                      Abrir
                    </Link>
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

export default AdminMessages;
