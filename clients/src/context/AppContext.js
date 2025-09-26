import React, { useState, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);

          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            setLoading(false);
            return;
          }

          const response = await api.get('/auth/profile');
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          await fetchComplaints();
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);


  const register = async (name, email, password, role, category) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password, role, category });
      const { token, role: userRole, category: userCategory } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      if (userCategory) localStorage.setItem('category', userCategory);

      const profileResponse = await api.get('/auth/profile');
      setCurrentUser(profileResponse.data);
      setIsAuthenticated(true);

      await fetchComplaints();
      return profileResponse.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role: userRole, category } = response.data;

      if (userRole !== role) {
        throw new Error(`This is a ${role} login. Please use the ${userRole} login option.`);
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      if (category) localStorage.setItem('category', category);

      const profileResponse = await api.get('/auth/profile');
      setCurrentUser(profileResponse.data);
      setIsAuthenticated(true);

      await fetchComplaints();
      return profileResponse.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed loading complaints:', err);
      setError('Failed to load complaints');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('category');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setComplaints([]);
      setError(null);
    }
  };

  const addComplaint = async (complaint) => {
    try {
      const response = await api.post('/complaints', {
        ...complaint,
        citizen: currentUser?.email || currentUser?.id
      });

      const newComplaint = response.data;
      setComplaints(prev => [newComplaint, ...prev]);
      return newComplaint;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create complaint';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateComplaintStatus = async (complaintId, status, note, updatedBy) => {
    try {
      const response = await api.put(`/complaints/${complaintId}`, {
        status,
        note,
        updatedBy
      });

      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? response.data : c
      ));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update complaint';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addResponse = async (complaintId, responseText) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/responses`, {
        text: responseText,
        from: currentUser?.email || currentUser?.name
      });

      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? response.data : c
      ));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add response';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getCategories = () => [
    'Road', 'Water', 'Electricity', 'Health', 'Sanitation',
    'Leadership', 'Infrastructure', 'Environment', 'PublicServices', 'Other'
  ];

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{
      complaints,
      currentUser,
      isAuthenticated,
      loading,
      error,
      register,
      login,
      fetchComplaints,
      logout,
      addComplaint,
      updateComplaintStatus,
      addResponse,
      getCategories,
      clearError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };