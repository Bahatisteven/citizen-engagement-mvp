import React, { useState, useEffect } from 'react';
import { mockComplaints, mockUsers } from '../data/mockData';
import api from '../api';

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }
  }, []);


  const register = async (name, email, password, role, category) => {
  try {
    const response = await api.post('/auth/register', { name, email, password, role, category });
    const { token, role: userRole, category: userCategory } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', email); 
    localStorage.setItem('role', userRole);
    localStorage.setItem('category', userCategory || '');

    const user = { email, role: userRole, category: userCategory || null };
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    return user;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Registration failed');
  }
};

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role: userRole, category } = response.data;
      
      if (userRole !== role) {
        throw new Error(`This is a ${role} login. Please use the ${userRole} login option.`);
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', mockUsers.find(u => u.email === email)?.id || 'unknown');
      localStorage.setItem('role', userRole);
      
      const user = { email, role: userRole, category: category || null };
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const addComplaint = (complaint) => {
    const institution = mockUsers.find(u => u.role === 'institution' && u.category === complaint.category);
    const newComplaint = {
      id: `C${complaints.length + 1}`.padStart(4, '0'),
      status: 'Open',
      citizen: currentUser?.id || 'unknown',
      createdAt: new Date().toISOString().split('T')[0],
      responses: [],
      assignedTo: institution ? institution.id : null,
      ...complaint
    };
    
    setComplaints([...complaints, newComplaint]);
    return newComplaint;
  };

  const updateComplaintStatus = (complaintId, status) => {
    setComplaints(complaints.map(c => 
      c.id === complaintId ? {...c, status} : c
    ));
  };

  const addResponse = (complaintId, responseText) => {
    const response = {
      text: responseText,
      from: currentUser?.id || 'unknown',
      date: new Date().toISOString().split('T')[0]
    };
    
    setComplaints(complaints.map(c => 
      c.id === complaintId ? {...c, responses: [...c.responses, response]} : c
    ));
  };

  const getUserById = (id) => mockUsers.find(u => u.id === id);
  const getCategories = () => [...new Set(mockUsers
    .filter(u => u.role === 'institution')
    .map(u => u.category)
  )];

  return (
    <AppContext.Provider value={{
      complaints,
      currentUser,
      isAuthenticated,
      register,
      login,
      logout,
      addComplaint,
      updateComplaintStatus,
      addResponse,
      getUserById,
      getCategories
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };