import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const resolveRolePath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'researcher') return '/researcher/dashboard';
  return '/explorer/dashboard';
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Completa email y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(formData);
      const userRole = response?.data?.user?.role;
      toast.success('Sesión iniciada correctamente.');
      navigate(resolveRolePath(userRole));
    } catch (error) {
      const message = error?.response?.data?.error || 'No se pudo iniciar sesión.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="auth-kicker">Acceso al sistema</p>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">
          Ingresa con tus credenciales para consultar, publicar y administrar hallazgos fósiles.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Correo electrónico
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="usuario@dominio.com"
            />
          </label>

          <label htmlFor="password">
            Contraseña
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Tu contraseña"
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footnote">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
