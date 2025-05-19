import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import InstitutionPending from './pages/InstitutionPending';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Submit from './pages/Submit';
import Status from './pages/Status';
import ComplaintDetail from './pages/ComplaintDetail';
import CitizenDashboard from './pages/CitizenDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import Admin from './pages/Admin';

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        {/* main application container */}
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <Routes>
            {/* public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/institution-pending" element={<InstitutionPending />} />
            <Route path="/status" element={<Status />} />
            
            {/* protected routes */}
            <Route path="/submit" element={<ProtectedRoute element={<Submit />} allowedRoles={['citizen']} />} />
            <Route path="/complaint/:complaintId" element={<ComplaintDetail />} />
            <Route path="/dashboard/citizen" element={<ProtectedRoute element={<CitizenDashboard />} allowedRoles={['citizen']} />} />
            <Route path="/dashboard/institution" element={<ProtectedRoute element={<InstitutionDashboard />} allowedRoles={['institution']} />} />
            <Route path="/dashboard/admin" element={<ProtectedRoute element={<Admin />} allowedRoles={['admin']} />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;