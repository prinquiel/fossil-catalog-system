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

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'explorer',
    first_name: '',
    last_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Completa username, email y contraseña.');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register(formData);
      const userRole = response?.data?.user?.role;
      toast.success('Cuenta creada correctamente.');
      navigate(resolveRolePath(userRole));
    } catch (error) {
      const message = error?.response?.data?.error || 'No se pudo completar el registro.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="auth-kicker">Nuevo usuario</p>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          Registra tu perfil para colaborar en documentación y análisis paleontológico.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">
            Nombre de usuario
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              placeholder="usuario_unico"
            />
          </label>

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
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </label>

          <div className="auth-row">
            <label htmlFor="first_name">
              Nombre
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </label>

            <label htmlFor="last_name">
              Apellido
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Apellido"
              />
            </label>
          </div>

          <label htmlFor="role">
            Rol
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="explorer">Explorer</option>
              <option value="researcher">Researcher</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footnote">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
