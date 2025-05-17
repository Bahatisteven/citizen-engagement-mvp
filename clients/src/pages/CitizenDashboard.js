import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const CitizenDashboard = () => {
  const { complaints, currentUser } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  
  if (!currentUser || currentUser.role !== 'citizen') {
    return <Navigate to="/login" />;
  }
  
  const userComplaints = complaints.filter(c => c.citizen === currentUser.id);
  const activeComplaints = userComplaints.filter(c => c.status !== 'Resolved');
  const resolvedComplaints = userComplaints.filter(c => c.status === 'Resolved');
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const displayComplaints = (complaintsToShow) => {
    if (complaintsToShow.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No complaints found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {complaintsToShow.map(complaint => (
          <div 
            key={complaint.id}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/complaint/${complaint.id}`)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{complaint.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">ID: {complaint.id} | Category: {complaint.category}</p>
            <p className="text-sm text-gray-500">Submitted on {complaint.createdAt}</p>
            <p className="text-sm text-gray-500">
              {complaint.responses.length > 0 
                ? `${complaint.responses.length} response(s)` 
                : 'No responses yet'}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Citizen Dashboard</h2>
          <Link 
            to="/submit" 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Submit New Complaint
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'active' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active Complaints ({activeComplaints.length})
            </button>
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'resolved' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({resolvedComplaints.length})
            </button>
          </div>
        </div>
        
        {activeTab === 'active' ? displayComplaints(activeComplaints) : displayComplaints(resolvedComplaints)}
      </div>
    </div>
  );
};

export default CitizenDashboard;