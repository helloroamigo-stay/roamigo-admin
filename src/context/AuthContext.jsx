import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState('');

  useEffect(() => {
    checkLoggedInStatus();

    const handleSessionExpired = (e) => {
      const msg = e.detail?.message || 'Session Expired: Your token has expired. Please log in again.';
      setUser(null);
      setSessionExpiredNotice(msg);
      setError(msg);
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, []);

  // Periodic session health check heartbeat (every 45s) when user is authenticated
  useEffect(() => {
    if (!user) return;

    const healthInterval = setInterval(async () => {
      const token = localStorage.getItem('roamigo_admin_token');
      if (!token) {
        setUser(null);
        setSessionExpiredNotice('Your session token was removed. Please log in again.');
        setError('Your session token was removed. Please log in again.');
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (!res.success || !res.data?.user) {
          throw { status: 401 };
        }
      } catch (err) {
        if (err.status === 401 || err.code === 'UNAUTHORIZED' || !localStorage.getItem('roamigo_admin_token')) {
          localStorage.removeItem('roamigo_admin_token');
          setUser(null);
          const msg = 'Session Expired: Your security token has expired. Please log in again.';
          setSessionExpiredNotice(msg);
          setError(msg);
        }
      }
    }, 45000);

    return () => clearInterval(healthInterval);
  }, [user]);

  const checkLoggedInStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('roamigo_admin_token');
      if (!token) {
        setUser(null);
        return;
      }

      const res = await authAPI.getMe();
      if (res.success && res.data.user) {
        if (res.data.user.role === 'ADMIN') {
          setUser(res.data.user);
          setSessionExpiredNotice('');
        } else {
          // If not an admin, log them out and clear status
          await authAPI.logout();
          setUser(null);
          setError('Access Denied: Admin role required.');
        }
      }
    } catch (err) {
      setUser(null);
      if (err.status === 401) {
        const msg = 'Session Expired: Your security token has expired. Please log in again.';
        setSessionExpiredNotice(msg);
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setSessionExpiredNotice('');
      setLoading(true);
      const res = await authAPI.login(email, password);
      
      if (res.success && res.data.user) {
        if (res.data.user.role === 'ADMIN') {
          if (res.data.accessToken) {
            localStorage.setItem('roamigo_admin_token', res.data.accessToken);
          }
          setUser(res.data.user);
          setSessionExpiredNotice('');
          return res.data.user;
        } else {
          localStorage.removeItem('roamigo_admin_token');
          await authAPI.logout();
          throw new Error('Access Denied: Admin role required.');
        }
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      const errMsg = err.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('roamigo_admin_token');
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setSessionExpiredNotice('');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    sessionExpiredNotice,
    login,
    logout,
    checkLoggedInStatus,
    setError,
    setSessionExpiredNotice
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
