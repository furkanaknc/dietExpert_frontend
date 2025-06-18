import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('authToken');
      if (token) {
        try {
          const verification = await authAPI.verifyToken(token);
          if (verification.verified && verification.user) {
            const userData = {
              id: verification.user.id,
              email: verification.user.email,
              first_name: verification.user.first_name,
              last_name: verification.user.last_name,
            };

            setCookie('user', JSON.stringify(userData), 7);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            deleteCookie('authToken');
            deleteCookie('user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          deleteCookie('authToken');
          deleteCookie('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      const verification = await authAPI.verifyToken(response.access_token);

      if (verification.verified && verification.user) {
        const userData = {
          id: verification.user.id,
          email: verification.user.email,
          first_name: verification.user.first_name,
          last_name: verification.user.last_name,
        };

        setCookie('user', JSON.stringify(userData), 7);
        setUser(userData);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
