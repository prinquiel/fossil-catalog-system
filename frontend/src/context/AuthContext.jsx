import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { authSession } from '../utils/authSession.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const me = await authService.getMe();
      if (me.success && me.data) {
        setUser(me.data);
        authSession.setUserRaw(JSON.stringify(me.data));
        return me.data;
      }
    } catch {
      authService.clearSession();
      setUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = authService.getToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const me = await authService.getMe();
        if (!cancelled && me.success && me.data) {
          setUser(me.data);
          authSession.setUserRaw(JSON.stringify(me.data));
        }
      } catch {
        if (!cancelled) {
          authService.clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.data?.user) {
      setUser(data.data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.data?.token) {
      setUser(data.data.user);
    } else {
      setUser(null);
    }
    return data;
  };

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    navigate('/', { replace: true });
  }, [navigate]);

  const value = {
    user,
    loading,
    refreshUser,
    login,
    register,
    logout,
    isAuthenticated: !!(authService.getToken() && user),
    isAdmin: user?.roles?.includes('admin') || user?.role === 'admin',
    isResearcher: user?.roles?.includes('researcher') || user?.role === 'researcher',
    isExplorer: user?.roles?.includes('explorer') || user?.role === 'explorer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
