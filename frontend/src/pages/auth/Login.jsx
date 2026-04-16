import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

function postLoginPath(user) {
  const r = user?.roles || (user?.role ? [user.role] : []);
  if (r.includes('admin')) return '/admin/dashboard';
  if (r.includes('researcher')) return '/researcher/dashboard';
  if (r.includes('explorer')) return '/explorer/dashboard';
  return '/catalog';
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        const to = location.state?.from?.pathname || postLoginPath(data.data.user);
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
        <p className="auth-eyebrow">Bienvenido de nuevo</p>
        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-lead">
          Accede con el correo y la contraseña de tu cuenta. Si acabas de registrarte, espera la aprobación del
          administrador; recibirás un correo cuando tu acceso esté activo.
        </p>

        <div className="auth-card">
          <form className="auth-form-grid" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-pass">Contraseña</label>
              <input
                id="login-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
