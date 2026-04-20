import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError.js';

const STATUS_LABEL = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

function AdminUsers() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
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
  }, [page, appliedSearch, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Directorio</p>
        <h1 className="admin-page-title">Usuarios</h1>
        <p className="admin-page-desc">
          Listado de cuentas registradas. Usa la busqueda o el filtro por estado de registro.
        </p>
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
            Estado:
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
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
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
                </tr>
              ))}
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
            Pagina {pagination.currentPage} de {pagination.totalPages}
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
    </>
  );
}

export default AdminUsers;
