import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      // Migrate old user format (id) to new format (_id)
      if (userData.id && !userData._id) {
        userData._id = userData.id;
      }
      setToken(storedToken);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      // Ensure user has _id field (migrate from id if needed)
      const normalizedUser = {
        ...userData,
        _id: userData._id || userData.id
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      setToken(newToken);
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      // Ensure user has _id field (migrate from id if needed)
      const normalizedUser = {
        ...newUser,
        _id: newUser._id || newUser.id
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      setToken(newToken);
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    // Ensure user has _id field (migrate from id if needed)
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id
    };
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};