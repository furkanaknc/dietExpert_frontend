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

// Cookie utility functions
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

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('authToken');
      if (token) {
        try {
          const verification = await authAPI.verifyToken(token);
          if (verification.verified && verification.user) {
            // Use the actual user data from verification
            const userData = {
              id: verification.user.id, // Real user ID from database
              email: verification.user.email,
              first_name: verification.user.first_name,
              last_name: verification.user.last_name,
            };

            setCookie('user', JSON.stringify(userData), 7);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
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

  // Listen for logout events from API interceptor
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

      // After successful login, verify to get user data
      const verification = await authAPI.verifyToken(response.access_token);

      if (verification.verified && verification.user) {
        // Use the actual user data from verification
        const userData = {
          id: verification.user.id, // Real user ID from database
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
      // After successful registration, you might want to auto-login
      // or redirect to login page
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

  // Guest login for users who don't want to register
  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Math.random().toString(36).substring(2, 10)}`,
      email: 'guest@dietexpert.com',
      isGuest: true,
    };

    setCookie('user', JSON.stringify(guestUser), 7);
    setUser(guestUser);
    setIsAuthenticated(true);

    return guestUser;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
