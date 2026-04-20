import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';

const STATUS_LABEL = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const DELETED_FILTER_OPTS = [
  { value: 'active', label: 'Solo activos' },
  { value: 'deleted', label: 'Solo dados de baja' },
  { value: 'all', label: 'Todos' },
];

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletedFilter, setDeletedFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, deleted_filter: deletedFilter };
      if (appliedSearch) params.search = appliedSearch;
      if (statusFilter) params.registration_status = statusFilter;
      const res = await adminService.getUsers(params);
      if (res.success) {
        setItems(res.data || []);
        setPagination(res.pagination || null);
      } else {
        toast.error(res.error || 'Error al cargar usuarios');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter, deletedFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const openDeleteDialog = (u) => {
    if (currentUser?.id != null && Number(currentUser.id) === Number(u.id)) {
      toast.error('No puede dar de baja su propia cuenta desde aquí.');
      return;
    }
    setDeleteTarget({ id: u.id, username: u.username, email: u.email });
  };

  const executeSoftDelete = async () => {
    if (!deleteTarget) return;
    const userId = deleteTarget.id;
    setBusyId(userId);
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        toast.success('Usuario dado de baja.');
        setDeleteTarget(null);
        load();
      } else {
        toast.error(res.error || 'No se pudo eliminar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (userId) => {
    setBusyId(userId);
    try {
      const res = await adminService.activateUser(userId);
      if (res.success) {
        toast.success('Usuario restaurado.');
        load();
      } else {
        toast.error(res.error || 'No se pudo restaurar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Directorio</p>
        <h1 className="admin-page-title">Usuarios</h1>
      </header>

      <div className="admin-toolbar">
        <form onSubmit={submitSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
          <input
            type="search"
            className="admin-search"
            placeholder="Buscar por nombre, email o usuario…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar usuarios"
          />
          <button type="submit" className="admin-btn admin-btn--ghost">
            Buscar
          </button>
        </form>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label htmlFor="reg-status" className="admin-page-desc" style={{ margin: 0, fontSize: '0.85rem' }}>
            Registro:
          </label>
          <select
            id="reg-status"
            className="admin-search"
            style={{ maxWidth: '200px', borderRadius: '12px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
          <label htmlFor="del-filter" className="admin-page-desc" style={{ margin: 0, fontSize: '0.85rem' }}>
            Cuenta:
          </label>
          <select
            id="del-filter"
            className="admin-search"
            style={{ maxWidth: '200px', borderRadius: '12px' }}
            value={deletedFilter}
            onChange={(e) => {
              setDeletedFilter(e.target.value);
              setPage(1);
            }}
          >
            {DELETED_FILTER_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="admin-empty">Cargando…</div>}

      {!loading && items.length === 0 && (
        <div className="admin-panel">
          <p className="admin-empty" style={{ margin: 0 }}>
            No hay resultados.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Registro</th>
                <th>Estado cuenta</th>
                <th style={{ minWidth: '200px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isDeleted = u.deleted_at != null;
                const isRowSelf = currentUser?.id != null && Number(currentUser.id) === Number(u.id);
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.username}</strong>
                      <br />
                      <span style={{ fontSize: '0.82rem', color: 'var(--earth-brown, #8a7356)' }}>
                        {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                      </span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {(u.roles || []).map((r) => (
                        <span key={r} className="admin-tag" style={{ marginRight: '6px' }}>
                          {r}
                        </span>
                      ))}
                    </td>
                    <td>{STATUS_LABEL[u.registration_status] || u.registration_status || '—'}</td>
                    <td>{isDeleted ? <span className="admin-tag">Baja</span> : <span>Activo</span>}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <Link to={`/admin/edit-user/${u.id}`} className="admin-btn admin-btn--ghost" style={{ padding: '6px 12px', fontSize: '0.84rem' }}>
                          Editar
                        </Link>
                        {isDeleted ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost"
                            style={{ padding: '6px 12px', fontSize: '0.84rem' }}
                            disabled={busyId === u.id}
                            onClick={() => handleRestore(u.id)}
                          >
                            {busyId === u.id ? '…' : 'Restaurar'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.84rem',
                              borderColor: 'rgba(145, 70, 70, 0.4)',
                              color: '#7a2e2e',
                            }}
                            disabled={busyId === u.id || isRowSelf}
                            title={isRowSelf ? 'No puede darse de baja a sí mismo' : 'Baja lógica'}
                            onClick={() => openDeleteDialog(u)}
                          >
                            {busyId === u.id ? '…' : 'Dar de baja'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      <AdminConfirmDialog
        open={deleteTarget != null}
        title="¿Dar de baja a este usuario?"
        confirmLabel="Dar de baja"
        cancelLabel="Cancelar"
        loading={deleteTarget != null && busyId === deleteTarget.id}
        onConfirm={executeSoftDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        <p style={{ margin: 0 }}>
          Se aplicará una <strong>eliminación lógica</strong> (baja). Podrá restaurar la cuenta después desde el
          listado.
        </p>
        {deleteTarget ? (
          <p style={{ marginTop: 14, marginBottom: 0 }}>
            <strong>{deleteTarget.username}</strong>
            <br />
            <span style={{ fontSize: '0.9rem', opacity: 0.95 }}>{deleteTarget.email}</span>
          </p>
        ) : null}
      </AdminConfirmDialog>
    </>
  );
}

export default AdminUsers;
