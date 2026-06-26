import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/healthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('meditrack_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('meditrack_token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('meditrack_user', JSON.stringify(userData));
    localStorage.setItem('meditrack_token', authToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('meditrack_user');
    localStorage.removeItem('meditrack_token');
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    persistAuth(data.user, data.token);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    persistAuth(data.user, data.token);
    return data;
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('meditrack_user', JSON.stringify(userData));
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const { data } = await authService.getProfile();
      updateUser(data);
    } catch {
      clearAuth();
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await authService.getProfile();
          setUser(data);
          localStorage.setItem('meditrack_user', JSON.stringify(data));
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
