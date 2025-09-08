import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const STORAGE_TOKEN_KEY = 'am_token';
  const STORAGE_USER_KEY = 'am_user';

  useEffect(() => {
    // Migrate legacy keys if present
    const legacyToken = localStorage.getItem('token');
    const legacyUser = localStorage.getItem('user');
    const namespacedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const namespacedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (!namespacedToken && legacyToken) {
      localStorage.setItem(STORAGE_TOKEN_KEY, legacyToken);
      localStorage.removeItem('token');
    }
    if (!namespacedUser && legacyUser) {
      localStorage.setItem(STORAGE_USER_KEY, legacyUser);
      localStorage.removeItem('user');
    }

    // Check if user is logged in on mount
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null' && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // Verify token validity
        auth.getProfile()
          .then(response => {
            const freshUser = response.data.data.user || response.data.data; // fallback if shape differs
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            // Token invalid, clear auth
            logout();
          });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await auth.login({ email, password });
      const payload = response.data?.data || {};
      // Normalize user object from payload (server returns flat fields + token)
      const userData = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        school: payload.school,
        class: payload.class,
        preferredLanguage: payload.preferredLanguage,
        region: payload.region,
        badges: payload.badges,
        points: payload.points,
        level: payload.level,
        profileImage: payload.profileImage
      };

      // Store token and user data (namespaced)
      if (payload.token) localStorage.setItem(STORAGE_TOKEN_KEY, payload.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await auth.register(userData);
      const payload = response.data?.data || {};
      const registeredUser = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        school: payload.school,
        class: payload.class,
        preferredLanguage: payload.preferredLanguage,
        region: payload.region,
        badges: payload.badges,
        points: payload.points,
        level: payload.level,
        profileImage: payload.profileImage
      };

      if (payload.token) localStorage.setItem(STORAGE_TOKEN_KEY, payload.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(registeredUser));
      
      setUser(registeredUser);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      
      return { success: true, data: registeredUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUserData = (newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ ...(user || {}), ...newUserData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};