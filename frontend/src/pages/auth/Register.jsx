import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const location = useLocation();
  const { register } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [workplace, setWorkplace] = useState('');
  /** explorer | researcher | both */
  const [roleProfile, setRoleProfile] = useState('explorer');

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!firstName.trim()) err.firstName = 'Requerido';
    if (!lastName.trim()) err.lastName = 'Requerido';
    if (!username.trim() || username.length < 3) err.username = 'Mínimo 3 caracteres';
    if (!email.trim() || !emailRe.test(email)) err.email = 'Correo no válido';
    if (!password || password.length < 8) err.password = 'Mínimo 8 caracteres';
    if (password !== confirmPassword) err.confirmPassword = 'Las contraseñas no coinciden';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Revisa los campos marcados');
      return;
    }

    const roles =
      roleProfile === 'both' ? ['explorer', 'researcher'] : [roleProfile];

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      roles,
    };
    if (country.trim()) payload.country = country.trim();
    if (profession.trim()) payload.profession = profession.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (workplace.trim()) payload.workplace = workplace.trim();

    setLoading(true);
    try {
      const data = await register(payload);
      if (data.success) {
        setSubmittedEmail(email.trim());
        setSubmitted(true);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'No se pudo completar el registro';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="auth-shell">
        <nav className="auth-nav" aria-label="Menu principal">
          <Link to="/">Inicio</Link>
          <Link to="/register" className={location.pathname === '/register' ? 'auth-nav-active' : undefined}>
            Registrarse
          </Link>
          <Link to="/login" className={location.pathname === '/login' ? 'auth-nav-active' : undefined}>
            Iniciar sesión
          </Link>
        </nav>

        <div className="auth-main">
          <div className="auth-card">
            <div className="auth-success">
              <div className="auth-success-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Solicitud recibida</h2>
              <p>
                Tu cuenta queda <strong>pendiente de aprobación</strong> por un administrador. Cuando sea
                aceptada, podrás iniciar sesión con el correo <strong>{submittedEmail}</strong>.
              </p>
              <div className="auth-email-callout">
                <strong>Notificación por correo</strong>
                <p>
                  Cuando un administrador apruebe tu registro, recibirás un <strong>correo de confirmación</strong>{' '}
                  en esa dirección (si el servidor de correo está configurado). Revisa también la carpeta de spam.
                </p>
              </div>
              <div className="auth-success-actions">
                <Link to="/login" className="auth-btn-primary-outline">
                  Ir a iniciar sesión
                </Link>
                <Link to="/" className="auth-btn-secondary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <nav className="auth-nav" aria-label="Menu principal">
        <Link to="/">Inicio</Link>
        <Link to="/register" className={location.pathname === '/register' ? 'auth-nav-active' : undefined}>
          Registrarse
        </Link>
        <Link to="/login" className={location.pathname === '/login' ? 'auth-nav-active' : undefined}>
          Iniciar sesión
        </Link>
      </nav>

      <div className="auth-main">
        <p className="auth-eyebrow">Cuenta de acceso</p>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-lead">
          Regístrate como explorador, investigador o ambos. Un administrador revisará tu solicitud antes de
          activar el acceso.
        </p>

        <div className="auth-card">
          <form className="auth-form-grid" onSubmit={handleSubmit} noValidate>
            <div className="auth-row-2">
              <div className="auth-field">
                <label htmlFor="reg-first">Nombre</label>
                <input
                  id="reg-first"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {fieldErrors.firstName && <p className="auth-field-error">{fieldErrors.firstName}</p>}
              </div>
              <div className="auth-field">
                <label htmlFor="reg-last">Apellidos</label>
                <input
                  id="reg-last"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {fieldErrors.lastName && <p className="auth-field-error">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-user">Usuario</label>
              <input
                id="reg-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {fieldErrors.username && <p className="auth-field-error">{fieldErrors.username}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
              <p className="auth-field-hint">Se usará para iniciar sesión y para notificaciones.</p>
            </div>

            <div className="auth-row-2">
              <div className="auth-field">
                <label htmlFor="reg-pass">Contraseña</label>
                <input
                  id="reg-pass"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
              </div>
              <div className="auth-field">
                <label htmlFor="reg-pass2">Confirmar contraseña</label>
                <input
                  id="reg-pass2"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {fieldErrors.confirmPassword && <p className="auth-field-error">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-role">Perfil solicitado</label>
              <select
                id="reg-role"
                className="auth-select"
                value={roleProfile}
                onChange={(e) => setRoleProfile(e.target.value)}
                aria-describedby="reg-role-hint"
              >
                <option value="explorer">Explorador</option>
                <option value="researcher">Investigador</option>
                <option value="both">Explorador e investigador</option>
              </select>
              <p id="reg-role-hint" className="auth-field-hint" style={{ marginTop: 8 }}>
                Explorador: registro de hallazgos en campo. Investigador: consulta del catálogo y estudios. Puedes
                solicitar ambos permisos en una sola cuenta.
              </p>
            </div>

            <div className="auth-field" style={{ marginTop: 4 }}>
              <label>Información adicional (opcional)</label>
              <div className="auth-row-2" style={{ marginTop: 10 }}>
                <div className="auth-field">
                  <input
                    type="text"
                    placeholder="País"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    aria-label="País"
                  />
                </div>
                <div className="auth-field">
                  <input
                    type="text"
                    placeholder="Profesión"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    aria-label="Profesión"
                  />
                </div>
              </div>
              <div className="auth-row-2" style={{ marginTop: 12 }}>
                <div className="auth-field">
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-label="Teléfono"
                  />
                </div>
                <div className="auth-field">
                  <input
                    type="text"
                    placeholder="Centro de trabajo"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    aria-label="Centro de trabajo"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
