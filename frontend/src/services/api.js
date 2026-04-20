import axios from 'axios';
import { apiRequestEnd, apiRequestStart } from './apiActivity';

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
    apiRequestStart();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    apiRequestEnd();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    apiRequestEnd();
    return response;
  },
  (error) => {
    apiRequestEnd();
    const reqUrl = error.config?.url || '';
    const isAuthAttempt = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');
    const isAuthMe = reqUrl.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!isAuthMe && !window.location.pathname.startsWith('/login')) {
        window.location.assign(`/login?expired=1&from=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
