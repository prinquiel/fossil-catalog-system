import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { workspaceHomePath } from '../../utils/workspace.js';
import './AuthPages.css';

function postLoginPath(user) {
  return workspaceHomePath(user) || '/catalog';
}

/** @param {string | null} raw */
function safeInternalPath(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      toast.error('La sesión expiró o ya no es válida. Inicie sesión de nuevo.');
      const next = new URLSearchParams(searchParams);
      next.delete('expired');
      next.delete('from');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Introduce correo y contraseña');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      if (data.success && data.data?.user) {
        toast.success('Sesión iniciada');
        const fromQuery = safeInternalPath(searchParams.get('from'));
        const to = location.state?.from?.pathname || fromQuery || postLoginPath(data.data.user);
        navigate(to, { replace: true });
      }
    } catch (error) {
      const res = error.response?.data;
      const code = res?.code;
      const msg = res?.error || 'No se pudo iniciar sesión';
      if (code === 'REGISTRATION_PENDING') {
        toast.error('Tu cuenta aún está pendiente de aprobación por un administrador.');
      } else if (code === 'REGISTRATION_REJECTED') {
        toast.error(
          res?.details?.rejection_reason
            ? `Registro rechazado: ${res.details.rejection_reason}`
            : 'Tu registro fue rechazado. Contacta al administrador.'
        );
      } else if (error.response?.status === 401) {
        toast.error('Credenciales incorrectas');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-page--cuaderno">
      <SiteHeader />

      <div className="auth-main auth-main--login">
        <div className="auth-login-intro">
          <p className="auth-eyebrow">Acceso al archivo</p>
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-lead">
            Usa el correo y la contraseña de tu cuenta. Si tu registro está pendiente, el administrador te
            notificará por correo cuando el acceso quede activo.
          </p>
          <p className="auth-login-note">misma política editorial que el catálogo público</p>
        </div>

        <div className="auth-card auth-card--login">
          <div className="auth-card-badge-row" aria-hidden="true">
            <span>HTTPS</span>
            <span>Sesión con rol</span>
          </div>
          <form className="auth-form-grid" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-pass">Contraseña</label>
              <div className="auth-password-field">
                <input
                  id="login-pass"
                  className="auth-password-field__input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-password-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
          <p className="auth-footer-text auth-footer-muted">
            ¿Solo quieres ver el archivo público? <Link to="/catalog">Ir al catálogo</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
