import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage on app boot
  useEffect(() => {
    const savedToken = localStorage.getItem('task_tracker_token');
    const savedUser = localStorage.getItem('task_tracker_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data.data;

      // Save to localStorage
      localStorage.setItem('task_tracker_token', receivedToken);
      localStorage.setItem('task_tracker_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const signup = async ({ name, email, password, role, tenantName, tenantId }) => {
    setError(null);
    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        password,
        role,
        tenantName,
        tenantId
      });
      const { token: receivedToken, user: receivedUser } = res.data.data;

      // Save to localStorage
      localStorage.setItem('task_tracker_token', receivedToken);
      localStorage.setItem('task_tracker_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err) {
      setError(err.message || 'Signup failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('task_tracker_token');
    localStorage.removeItem('task_tracker_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
