import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider, AppContext } from './context/AppContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { FullPageLoader } from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
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

const AppContent = () => {
  const { loading, error, clearError } = React.useContext(AppContext);

  if (loading) {
    return <FullPageLoader text="Initializing application..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      {error && (
        <div className="container mx-auto px-4 py-2">
          <ErrorAlert error={error} onDismiss={clearError} />
        </div>
      )}
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
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;