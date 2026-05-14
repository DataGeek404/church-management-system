'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage/cookies on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = Cookies.get('auth_token') || localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Verify token is still valid
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
          } else {
            // Token is invalid, clear it
            Cookies.remove('auth_token');
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      const newToken = data.token;

      // Store token in both cookies and localStorage
      Cookies.set('auth_token', newToken, { expires: 7 });
      localStorage.setItem('auth_token', newToken);

      setToken(newToken);
      setUser(data.data);

      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      const newToken = data.token;

      // Store token
      Cookies.set('auth_token', newToken, { expires: 7 });
      localStorage.setItem('auth_token', newToken);

      setToken(newToken);
      setUser(data.data);

      return data.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        logout();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.token;

      Cookies.set('auth_token', newToken, { expires: 7 });
      localStorage.setItem('auth_token', newToken);

      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

