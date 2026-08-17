import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res.success && res.data.user) {
        if (res.data.user.role === 'ADMIN') {
          setUser(res.data.user);
        } else {
          // If not an admin, log them out and clear status
          await authAPI.logout();
          setUser(null);
          setError('Access Denied: Admin role required.');
        }
      }
    } catch (err) {
      // User is not logged in, ignore error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authAPI.login(email, password);
      
      if (res.success && res.data.user) {
        if (res.data.user.role === 'ADMIN') {
          if (res.data.accessToken) {
            localStorage.setItem('roamigo_admin_token', res.data.accessToken);
          }
          setUser(res.data.user);
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
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkLoggedInStatus,
    setError
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
