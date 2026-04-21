import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { userService } from '../../services/userService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { filterPhoneInput } from '../../utils/studyProfileDefaults.js';
import './UserProfileSettings.css';

function roleLabel(r) {
  if (r === 'explorer') return 'Explorador';
  if (r === 'researcher') return 'Investigador';
  if (r === 'admin') return 'Administrador';
  return r;
}

/**
 * @param {{ variant?: 'workspace' | 'public' }} props
 */
export default function UserProfileSettings({ variant = 'workspace' }) {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    first_name: '',
    last_name: '',
    country: '',
    profession: '',
    phone: '',
    workplace: '',
  });

  const rolesList = useMemo(() => {
    if (user?.roles?.length) return user.roles;
    if (user?.role) return [user.role];
    return [];
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDraft({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      country: user.country || '',
      profession: user.profession || '',
      phone: user.phone || '',
      workplace: user.workplace || '',
    });
  }, [user]);

  const resetDraftFromUser = () => {
    if (!user) return;
    setDraft({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      country: user.country || '',
      profession: user.profession || '',
      phone: user.phone || '',
      workplace: user.workplace || '',
    });
  };

  const handleCancel = () => {
    resetDraftFromUser();
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await userService.updateUser(user.id, {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        country: draft.country.trim(),
        profession: draft.profession.trim(),
        phone: draft.phone.trim(),
        workplace: draft.workplace.trim(),
      });
      if (res.success && res.data) {
        toast.success('Perfil actualizado.');
        await refreshUser();
        setEditing(false);
      } else {
        toast.error(res.error || 'No se pudo guardar.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setField = (key) => (e) => {
    const v = e.target.value;
    if (key === 'phone') {
      setDraft((d) => ({ ...d, phone: filterPhoneInput(v) }));
    } else {
      setDraft((d) => ({ ...d, [key]: v }));
    }
  };

  if (!user) {
    return null;
  }

  const rootClass = `profile-settings${variant === 'public' ? ' profile-settings--public' : ''}`;

  return (
    <div className={rootClass}>
      <header className="profile-settings__hero">
        <p className="profile-settings__eyebrow">Cuenta institucional</p>
        <h1 className="profile-settings__title">Mi perfil</h1>
        <p className="profile-settings__lead">
          Actualice sus datos de contacto y filiación. El correo y los roles los gestiona el equipo de
          administración; el nombre de usuario identifica su sesión y no se modifica aquí.
        </p>
      </header>

      <div className="profile-settings__grid">
        <section className="profile-settings__card" aria-labelledby="profile-locked-heading">
          <div className="profile-settings__card-head">
            <div>
              <h2 id="profile-locked-heading" className="profile-settings__card-title">
                Datos de acceso
              </h2>
              <p className="profile-settings__card-sub">Solo lectura</p>
            </div>
          </div>
          <p className="profile-settings__lock-note" role="note">
            Para cambiar correo o roles, contacte a un administrador.
          </p>
          <dl className="profile-settings__dl">
            <div>
              <dt>Correo electrónico</dt>
              <dd>{user.email || '—'}</dd>
            </div>
            <div>
              <dt>Usuario</dt>
              <dd>{user.username || '—'}</dd>
            </div>
            <div>
              <dt>Roles</dt>
              <dd>
                {rolesList.length ? (
                  <span className="profile-settings__roles">
                    {rolesList.map((r) => (
                      <span key={r} className="profile-settings__role-pill">
                        {roleLabel(r)}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="profile-settings__muted">—</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="profile-settings__card" aria-labelledby="profile-edit-heading">
          <div className="profile-settings__card-head">
            <div>
              <h2 id="profile-edit-heading" className="profile-settings__card-title">
                Información personal
              </h2>
              <p className="profile-settings__card-sub">
                Visible en fichas y estudios cuando use los datos de contacto sugeridos.
              </p>
            </div>
            {!editing ? (
              <button
                type="button"
                className="profile-settings__btn profile-settings__btn--primary"
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
            ) : null}
          </div>

          {!editing ? (
            <dl className="profile-settings__dl">
              <div>
                <dt>Nombre</dt>
                <dd>{user.first_name ? user.first_name : <span className="profile-settings__muted">—</span>}</dd>
              </div>
              <div>
                <dt>Apellido</dt>
                <dd>{user.last_name ? user.last_name : <span className="profile-settings__muted">—</span>}</dd>
              </div>
              <div>
                <dt>País</dt>
                <dd>{user.country ? user.country : <span className="profile-settings__muted">—</span>}</dd>
              </div>
              <div>
                <dt>Profesión</dt>
                <dd>{user.profession ? user.profession : <span className="profile-settings__muted">—</span>}</dd>
              </div>
              <div>
                <dt>Celular</dt>
                <dd>{user.phone ? user.phone : <span className="profile-settings__muted">—</span>}</dd>
              </div>
              <div>
                <dt>Institución / centro de trabajo</dt>
                <dd>{user.workplace ? user.workplace : <span className="profile-settings__muted">—</span>}</dd>
              </div>
            </dl>
          ) : (
            <form className="profile-settings__form" onSubmit={handleSave}>
              <div className="profile-settings__form-row">
                <div className="profile-settings__form-field">
                  <label htmlFor="pf-first">Nombre</label>
                  <input id="pf-first" value={draft.first_name} onChange={setField('first_name')} autoComplete="given-name" />
                </div>
                <div className="profile-settings__form-field">
                  <label htmlFor="pf-last">Apellido</label>
                  <input id="pf-last" value={draft.last_name} onChange={setField('last_name')} autoComplete="family-name" />
                </div>
              </div>
              <div className="profile-settings__form-field">
                <label htmlFor="pf-country">País</label>
                <input id="pf-country" value={draft.country} onChange={setField('country')} autoComplete="country-name" />
              </div>
              <div className="profile-settings__form-field">
                <label htmlFor="pf-prof">Profesión</label>
                <input id="pf-prof" value={draft.profession} onChange={setField('profession')} autoComplete="organization-title" />
              </div>
              <div className="profile-settings__form-field">
                <label htmlFor="pf-phone">Celular</label>
                <input
                  id="pf-phone"
                  type="tel"
                  inputMode="tel"
                  value={draft.phone}
                  onChange={setField('phone')}
                  autoComplete="tel"
                  placeholder="+506 …"
                />
              </div>
              <div className="profile-settings__form-field">
                <label htmlFor="pf-work">Institución / centro de trabajo</label>
                <input
                  id="pf-work"
                  value={draft.workplace}
                  onChange={setField('workplace')}
                  autoComplete="organization"
                />
              </div>
              <div className="profile-settings__actions">
                <button type="submit" className="profile-settings__btn profile-settings__btn--primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="profile-settings__btn profile-settings__btn--ghost"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
