import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import './adminPages.css';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog.jsx';

const ROLE_OPTS = [
  { value: 'explorer', label: 'Explorador' },
  { value: 'researcher', label: 'Investigador' },
  { value: 'admin', label: 'Administrador' },
];

function rolesEqual(a, b) {
  const x = [...(a || [])].sort().join(',');
  const y = [...(b || [])].sort().join(',');
  return x === y;
}

function AdminEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const numericId = Number(id);
  const isSelf = currentUser?.id != null && Number(currentUser.id) === numericId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialRoles, setInitialRoles] = useState([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    country: '',
    profession: '',
    phone: '',
    workplace: '',
  });
  const [roles, setRoles] = useState(['explorer']);
  const [deletedAt, setDeletedAt] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const toggleRole = (value) => {
    setRoles((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.getUserById(id);
        if (!mounted) return;
        if (!res.success || !res.data) {
          toast.error(res.error || 'No se pudo cargar el usuario');
          navigate('/admin/users');
          return;
        }
        const u = res.data;
        setDeletedAt(u.deleted_at || null);
        setForm({
          username: u.username || '',
          email: u.email || '',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          country: u.country || '',
          profession: u.profession || '',
          phone: u.phone || '',
          workplace: u.workplace || '',
        });
        const r = Array.isArray(u.roles) ? u.roles : [];
        setRoles(r.length ? r : ['explorer']);
        setInitialRoles(r.length ? [...r] : ['explorer']);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
        navigate('/admin/users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const rolesDirty = useMemo(() => !rolesEqual(roles, initialRoles), [roles, initialRoles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim()) {
      toast.error('Usuario y correo son obligatorios.');
      return;
    }
    if (roles.length === 0) {
      toast.error('Seleccione al menos un rol.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        country: form.country.trim() || null,
        profession: form.profession.trim() || null,
        phone: form.phone.trim() || null,
        workplace: form.workplace.trim() || null,
      };
      const res = await adminService.updateUser(id, payload);
      if (!res.success) {
        toast.error(res.error || 'No se pudo guardar');
        return;
      }
      if (rolesDirty) {
        const r2 = await adminService.updateUserRoles(id, roles);
        if (!r2.success) {
          toast.error(r2.error || 'Perfil guardado; error al actualizar roles');
          return;
        }
        setInitialRoles([...roles]);
      }
      toast.success('Cambios guardados.');
      navigate('/admin/users');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = () => {
    if (isSelf) {
      toast.error('No puede eliminar su propia cuenta desde aquí.');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const executeSoftDelete = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await adminService.deleteUser(id);
      if (res.success) {
        toast.success('Usuario dado de baja.');
        setDeleteDialogOpen(false);
        navigate('/admin/users');
      } else {
        toast.error(res.error || 'No se pudo eliminar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      const res = await adminService.activateUser(id);
      if (res.success) {
        toast.success('Usuario restaurado.');
        setDeletedAt(null);
        navigate('/admin/users');
      } else {
        toast.error(res.error || 'No se pudo restaurar');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-panel admin-empty" style={{ maxWidth: 560 }}>
        Cargando usuario…
      </div>
    );
  }

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Edición</p>
        <h1 className="admin-page-title">Editar usuario</h1>
        <p className="admin-page-desc">
          Actualice datos de la cuenta y roles. La eliminación es lógica (baja); puede restaurar usuarios dados de
          baja desde el listado o aquí.
        </p>
      </header>

      {deletedAt ? (
        <div
          className="admin-panel"
          style={{
            maxWidth: 560,
            marginBottom: 16,
            borderColor: 'rgba(145, 90, 70, 0.45)',
            background: 'rgba(255, 245, 238, 0.95)',
          }}
        >
          <p className="admin-page-desc" style={{ margin: 0, fontWeight: 700 }}>
            Este usuario está dado de baja (eliminación lógica).
          </p>
          <p className="admin-page-desc" style={{ marginTop: 8, marginBottom: 0 }}>
            Para volver a habilitar la cuenta, use Restaurar. Si solo necesita corregir datos, restaure primero y
            luego edite.
          </p>
          <div className="admin-actions-row" style={{ marginTop: 14 }}>
            <button type="button" className="admin-btn" disabled={saving} onClick={handleRestore}>
              {saving ? 'Procesando…' : 'Restaurar usuario'}
            </button>
          </div>
        </div>
      ) : null}

      <form className="admin-panel" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div style={{ display: 'grid', gap: '14px' }}>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Usuario</span>
            <input
              className="admin-search"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
              autoComplete="off"
            />
          </label>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Correo</span>
            <input
              type="email"
              className="admin-search"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <div className="admin-page-desc" style={{ margin: 0 }}>
            <span style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Roles</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {ROLE_OPTS.map((r) => (
                <label
                  key={r.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(r.value)}
                    onChange={() => toggleRole(r.value)}
                    disabled={!!deletedAt}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Nombre</span>
              <input
                className="admin-search"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                disabled={!!deletedAt}
              />
            </label>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Apellidos</span>
              <input
                className="admin-search"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                disabled={!!deletedAt}
              />
            </label>
          </div>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>País (opcional)</span>
            <input
              className="admin-search"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              disabled={!!deletedAt}
            />
          </label>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Profesión (opcional)</span>
            <input
              className="admin-search"
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
              disabled={!!deletedAt}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Teléfono</span>
              <input
                className="admin-search"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                disabled={!!deletedAt}
              />
            </label>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Centro de trabajo</span>
              <input
                className="admin-search"
                value={form.workplace}
                onChange={(e) => setForm((f) => ({ ...f, workplace: e.target.value }))}
                disabled={!!deletedAt}
              />
            </label>
          </div>
        </div>
        <div className="admin-actions-row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <button type="submit" className="admin-btn" disabled={saving || !!deletedAt}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link to="/admin/users" className="admin-btn admin-btn--ghost">
            Volver al listado
          </Link>
          {!deletedAt ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              style={{ borderColor: 'rgba(145, 70, 70, 0.45)', color: '#7a2e2e' }}
              disabled={saving || deleteSubmitting || isSelf}
              onClick={openDeleteDialog}
              title={isSelf ? 'No puede eliminar su propia cuenta' : 'Eliminación lógica'}
            >
              Dar de baja
            </button>
          ) : null}
        </div>
      </form>

      <AdminConfirmDialog
        open={deleteDialogOpen}
        title="¿Dar de baja a este usuario?"
        confirmLabel="Dar de baja"
        cancelLabel="Cancelar"
        loading={deleteSubmitting}
        onConfirm={executeSoftDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      >
        <p style={{ margin: 0 }}>
          Se aplicará una <strong>eliminación lógica</strong>. Podrá restaurar la cuenta después desde el listado de
          usuarios.
        </p>
        <p style={{ marginTop: 14, marginBottom: 0 }}>
          <strong>{form.username}</strong>
          <br />
          <span style={{ fontSize: '0.9rem', opacity: 0.95 }}>{form.email}</span>
        </p>
      </AdminConfirmDialog>
    </>
  );
}

export default AdminEditUser;
