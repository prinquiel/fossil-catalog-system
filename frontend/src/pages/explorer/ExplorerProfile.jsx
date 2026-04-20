import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../workspace/workspace-pages.css';

function ExplorerProfile() {
  const { user, refreshUser } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const next = await refreshUser();
      if (next) toast.success('Perfil sincronizado con el servidor.');
      else toast.error('No fue posible actualizar el perfil.');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSyncing(false);
    }
  };

  const roles = user?.roles?.length ? user.roles.join(', ') : user?.role || '—';

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Cuenta</p>
      <h1 className="workspace-page__title">Mi perfil</h1>
      <p className="workspace-page__lead">
        Datos asociados a su sesión. Si un administrador actualiza sus roles, use sincronizar para reflejar el
        cambio sin cerrar sesión.
      </p>

      <div className="workspace-card">
        <dl style={{ margin: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <dt className="workspace-muted" style={{ marginBottom: 4 }}>
              Correo
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{user?.email || '—'}</dd>
          </div>
          <div style={{ marginBottom: 12 }}>
            <dt className="workspace-muted" style={{ marginBottom: 4 }}>
              Usuario
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{user?.username || '—'}</dd>
          </div>
          <div style={{ marginBottom: 12 }}>
            <dt className="workspace-muted" style={{ marginBottom: 4 }}>
              Nombre
            </dt>
            <dd style={{ margin: 0 }}>
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="workspace-muted" style={{ marginBottom: 4 }}>
              Roles
            </dt>
            <dd style={{ margin: 0 }}>{roles}</dd>
          </div>
        </dl>
        <div className="workspace-actions">
          <button type="button" className="workspace-btn" disabled={syncing} onClick={handleSync}>
            {syncing ? 'Sincronizando…' : 'Sincronizar con servidor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExplorerProfile;
