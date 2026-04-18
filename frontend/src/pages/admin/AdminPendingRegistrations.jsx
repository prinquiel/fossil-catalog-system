import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function AdminPendingRegistrations() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingRegistrations({ page: 1, limit: 50 });
      if (res.success) {
        setItems(res.data || []);
        setPagination(res.pagination || null);
      } else {
        toast.error(res.error || 'Error al cargar solicitudes');
      }
    } catch {
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (rejectFor === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setRejectFor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rejectFor]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      const res = await adminService.approveRegistration(id);
      if (res.success) {
        if (res.email?.sent) {
          toast.success('Registro aprobado. Correo enviado.');
        } else if (res.email?.skipped) {
          toast.success('Registro aprobado. Correo no enviado (SMTP no configurado).');
        } else {
          toast.success('Registro aprobado.');
        }
        await load();
      } else {
        toast.error(res.error || 'No se pudo aprobar');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al aprobar');
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectFor) return;
    setBusyId(rejectFor);
    try {
      const res = await adminService.rejectRegistration(rejectFor, rejectReason.trim() || null);
      if (res.success) {
        toast.success('Registro rechazado');
        setRejectFor(null);
        setRejectReason('');
        await load();
      } else {
        toast.error(res.error || 'No se pudo rechazar');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al rechazar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Aprobaciones</p>
        <h1 className="admin-page-title">Registros pendientes</h1>
        <p className="admin-page-desc">
          Usuarios que solicitaron acceso como explorador o investigador. Al aprobar, pueden iniciar sesion y
          se envia un correo si el servidor SMTP esta configurado.
        </p>
      </header>

      {pagination && (
        <p className="admin-page-desc" style={{ marginBottom: '18px' }}>
          Total pendientes: <strong>{pagination.totalItems}</strong>
        </p>
      )}

      {loading && <div className="admin-empty">Cargando solicitudes…</div>}

      {!loading && items.length === 0 && (
        <div className="admin-panel">
          <p className="admin-empty" style={{ margin: 0 }}>
            No hay solicitudes pendientes.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-user-cards">
          {items.map((u, idx) => (
            <article
              key={u.id}
              className="admin-user-card"
              style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
            >
              <div>
                <h2 className="admin-user-card__name">
                  {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username}
                </h2>
                <p className="admin-user-card__meta">
                  {u.email}
                  <br />
                  @{u.username}
                  {u.country ? ` · ${u.country}` : ''}
                  <br />
                  <span style={{ opacity: 0.85 }}>Solicitud: {formatDate(u.created_at)}</span>
                </p>
                <div className="admin-user-card__roles">
                  {(u.roles || []).map((r) => (
                    <span key={r} className="admin-tag admin-tag--ruby">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="admin-user-card__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  disabled={busyId === u.id}
                  onClick={() => approve(u.id)}
                >
                  {busyId === u.id ? 'Procesando…' : 'Aprobar'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  disabled={busyId === u.id}
                  onClick={() => {
                    setRejectFor(u.id);
                    setRejectReason('');
                  }}
                >
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {rejectFor !== null && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
          onClick={(e) => e.target === e.currentTarget && setRejectFor(null)}
        >
          <div className="admin-modal">
            <h3 id="reject-title">Rechazar registro</h3>
            <label htmlFor="reject-reason">Motivo (opcional)</label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Se mostrara al usuario si lo guardamos en el sistema."
            />
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setRejectFor(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                disabled={busyId !== null}
                onClick={confirmReject}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPendingRegistrations;
