/**
 * Sesión en sessionStorage: cada pestaña tiene su propio token/usuario.
 * localStorage se comparte entre pestañas del mismo origen y hace que varios
 * inicios de sesión se pisen entre sí.
 *
 * Migra una vez desde localStorage (versiones anteriores) para no forzar re-login.
 */
let legacyMigrated = false;

function migrateFromLocalStorage() {
  if (legacyMigrated || typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  legacyMigrated = true;
  try {
    if (sessionStorage.getItem('token')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    sessionStorage.setItem('token', token);
    const user = localStorage.getItem('user');
    if (user) sessionStorage.setItem('user', user);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    /* modo privado / cuota */
  }
}

export const authSession = {
  getToken() {
    migrateFromLocalStorage();
    try {
      return sessionStorage.getItem('token');
    } catch {
      return null;
    }
  },

  setToken(token) {
    sessionStorage.setItem('token', token);
  },

  getUserRaw() {
    migrateFromLocalStorage();
    try {
      return sessionStorage.getItem('user');
    } catch {
      return null;
    }
  },

  setUserRaw(json) {
    sessionStorage.setItem('user', json);
  },

  clear() {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch {
      /* ignore */
    }
  },
};
