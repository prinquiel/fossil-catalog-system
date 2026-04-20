import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const alive = useRef(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getUserStats();
      if (!alive.current) return;
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setStats(null);
        setLoadError(res.error || 'Respuesta incompleta del servidor');
      }
    } catch (e) {
      if (!alive.current) return;
      const msg =
        e?.response?.data?.error ||
        (e instanceof Error ? e.message : '') ||
        'No se pudieron cargar las estadisticas';
      setStats(null);
      setLoadError(msg);
      toast.error(msg);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    fetchStats();
    return () => {
      alive.current = false;
    };
  }, [fetchStats]);

  const n = (v) => (v !== undefined && v !== null ? Number(v) : 0);

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Resumen</p>
        <h1 className="admin-page-title">Panel de administración</h1>
        <p className="admin-page-desc">
          Vista general de usuarios y solicitudes de registro. Las cifras se actualizan al cargar esta pagina.
        </p>
      </header>

      {loading && <p className="admin-page-desc">Cargando datos…</p>}

      {!loading && !stats && (
        <div className="admin-panel admin-panel--notice" style={{ marginTop: 8 }}>
          <p className="admin-page-desc" style={{ marginTop: 0 }}>
            {loadError
              ? 'No se pudo obtener el resumen numérico. Si ves «Rol no autorizado», cierra sesión y vuelve a entrar para renovar el token.'
              : 'No hay datos de resumen disponibles en este momento.'}
          </p>
          {loadError && (
            <p className="admin-page-desc" style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {loadError}
            </p>
          )}
          <div className="admin-actions-row" style={{ marginTop: 12 }}>
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => fetchStats()}>
              Reintentar
            </button>
            <Link to="/admin/pending-registrations" className="admin-btn admin-btn--ghost">
              Solicitudes de registro
            </Link>
            <Link to="/admin/users" className="admin-btn admin-btn--ghost">
              Usuarios
            </Link>
            <Link to="/admin/stats" className="admin-btn admin-btn--ghost">
              Estadísticas del archivo
            </Link>
          </div>
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="admin-card-grid">
            <div className="admin-stat-card admin-stat-card--accent" style={{ animationDelay: '0.05s' }}>
              <div className="admin-stat-card__value">{n(stats.pending_registrations)}</div>
              <div className="admin-stat-card__label">Registros pendientes</div>
            </div>
            <div className="admin-stat-card" style={{ animationDelay: '0.12s' }}>
              <div className="admin-stat-card__value">{n(stats.total_active)}</div>
              <div className="admin-stat-card__label">Usuarios activos</div>
            </div>
            <div className="admin-stat-card" style={{ animationDelay: '0.19s' }}>
              <div className="admin-stat-card__value">{n(stats.explorers)}</div>
              <div className="admin-stat-card__label">Exploradores</div>
            </div>
            <div className="admin-stat-card" style={{ animationDelay: '0.26s' }}>
              <div className="admin-stat-card__value">{n(stats.researchers)}</div>
              <div className="admin-stat-card__label">Investigadores</div>
            </div>
            <div className="admin-stat-card" style={{ animationDelay: '0.33s' }}>
              <div className="admin-stat-card__value">{n(stats.admins)}</div>
              <div className="admin-stat-card__label">Administradores</div>
            </div>
            <div className="admin-stat-card" style={{ animationDelay: '0.4s' }}>
              <div className="admin-stat-card__value">{n(stats.total_inactive)}</div>
              <div className="admin-stat-card__label">Cuentas inactivas</div>
            </div>
          </div>

          <div className="admin-actions-row">
            <Link to="/admin/pending-registrations" className="admin-btn admin-btn--primary">
              Revisar solicitudes
            </Link>
            <Link to="/admin/users" className="admin-btn admin-btn--ghost">
              Gestionar usuarios
            </Link>
            <Link to="/admin/pending-fossils" className="admin-btn admin-btn--ghost">
              Fosiles pendientes
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default AdminDashboard;
