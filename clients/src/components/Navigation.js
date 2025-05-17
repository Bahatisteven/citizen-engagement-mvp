import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = React.useContext(AppContext);
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CitizenVoice</Link>
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-blue-200 transition-colors">Home</Link></li>
          <li><Link to="/submit" className="hover:text-blue-200 transition-colors">Submit Complaint</Link></li>
          <li><Link to="/status" className="hover:text-blue-200 transition-colors">Track Status</Link></li>
          
          {role === 'citizen' && (
            <li><Link to="/dashboard/citizen" className="hover:text-blue-200 transition-colors">My Dashboard</Link></li>
          )}
          {role === 'institution' && (
            <li><Link to="/dashboard/institution" className="hover:text-blue-200 transition-colors">Institution Dashboard</Link></li>
          )}
          {role === 'admin' && (
            <li><Link to="/dashboard/admin" className="hover:text-blue-200 transition-colors">Admin Dashboard</Link></li>
          )}
          
          {!currentUser ? (
            <li><Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link></li>
          ) : (
            <li><button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors">Logout</button></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;