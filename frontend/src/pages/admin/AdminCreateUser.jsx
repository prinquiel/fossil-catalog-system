import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import '../admin/adminPages.css';

const ROLE_OPTS = [
  { value: 'explorer', label: 'Explorador' },
  { value: 'researcher', label: 'Investigador' },
  { value: 'admin', label: 'Administrador' },
];

function AdminCreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    country: '',
    profession: '',
    phone: '',
    workplace: '',
  });
  const [roles, setRoles] = useState(['explorer']);

  const toggleRole = (value) => {
    setRoles((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      toast.error('Usuario, correo y contraseña son obligatorios.');
      return;
    }
    if (roles.length === 0) {
      toast.error('Seleccione al menos un rol.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        roles,
      };
      if (form.first_name.trim()) payload.first_name = form.first_name.trim();
      if (form.last_name.trim()) payload.last_name = form.last_name.trim();
      if (form.country.trim()) payload.country = form.country.trim();
      if (form.profession.trim()) payload.profession = form.profession.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.workplace.trim()) payload.workplace = form.workplace.trim();

      const res = await adminService.createUser(payload);
      if (res.success) {
        toast.success('Usuario creado y aprobado.');
        navigate('/admin/users');
      } else {
        toast.error(res.error || 'No se pudo crear el usuario');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Alta directa</p>
        <h1 className="admin-page-title">Crear usuario</h1>
        <p className="admin-page-desc">
          Crea una cuenta ya aprobada con los roles institucionales que correspondan. El usuario podrá iniciar
          sesión de inmediato con la contraseña indicada.
        </p>
      </header>

      <form className="admin-panel" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div style={{ display: 'grid', gap: '14px' }}>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Usuario</span>
            <input
              className="admin-search"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
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
            />
          </label>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Contraseña inicial</span>
            <input
              type="password"
              className="admin-search"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
              />
            </label>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Apellidos</span>
              <input
                className="admin-search"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </label>
          </div>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>País (opcional)</span>
            <input
              className="admin-search"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </label>
          <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Profesión (opcional)</span>
            <input
              className="admin-search"
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Teléfono</span>
              <input
                className="admin-search"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </label>
            <label className="admin-page-desc" style={{ display: 'grid', gap: 6, margin: 0 }}>
              <span style={{ fontWeight: 700 }}>Centro de trabajo</span>
              <input
                className="admin-search"
                value={form.workplace}
                onChange={(e) => setForm((f) => ({ ...f, workplace: e.target.value }))}
              />
            </label>
          </div>
        </div>
        <div className="admin-actions-row">
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Guardando…' : 'Crear usuario'}
          </button>
          <Link to="/admin/users" className="admin-btn admin-btn--ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}

export default AdminCreateUser;
