import axios from 'axios';

// El backend monta las rutas bajo /api (p. ej. /api/fossils). Sin el sufijo /api las peticiones fallan (404).
const resolveApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    let base = fromEnv.replace(/\/$/, '');
    // Evita 404: el servidor solo expone rutas bajo /api (p. ej. VITE_API_URL=http://localhost:5001 sin /api).
    if (!base.endsWith('/api')) {
      base = `${base}/api`;
    }
    return base;
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
