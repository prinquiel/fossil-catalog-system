import api from './api';
import { authSession } from '../utils/authSession.js';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data?.token) {
      authSession.setToken(response.data.data.token);
      authSession.setUserRaw(JSON.stringify(response.data.data.user));
    } else if (response.data.success) {
      authSession.clear();
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      authSession.setToken(response.data.data.token);
      authSession.setUserRaw(JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  clearSession() {
    authSession.clear();
  },

  /** @deprecated Prefer AuthContext.logout() para evitar recarga completa */
  logout() {
    this.clearSession();
    window.location.href = '/';
  },

  getCurrentUser() {
    const userStr = authSession.getUserRaw();
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return authSession.getToken();
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
