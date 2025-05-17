import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const InstitutionDashboard = () => {
  const { complaints, currentUser, getUserById } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open');
  
  if (!currentUser || currentUser.role !== 'institution') {
    return <Navigate to="/login" />;
  }
  
  const institutionComplaints = complaints.filter(c => c.assignedTo === currentUser.id);
  const openComplaints = institutionComplaints.filter(c => c.status === 'Open');
  const inProgressComplaints = institutionComplaints.filter(c => c.status === 'In Progress');
  const resolvedComplaints = institutionComplaints.filter(c => c.status === 'Resolved');
  
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
        {complaintsToShow.map(complaint => {
          const citizen = getUserById(complaint.citizen);
          
          return (
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
              <p className="text-sm text-gray-600 mb-1">ID: {complaint.id} | Submitted on {complaint.createdAt}</p>
              <p className="text-sm text-gray-600 mb-2">From: {citizen?.name || 'Unknown Citizen'}</p>
              <p className="text-gray-700 line-clamp-2 mb-2">{complaint.description}</p>
              <p className="text-sm text-gray-500">
                {complaint.responses.length > 0 
                  ? `${complaint.responses.length} response(s)` 
                  : 'No responses yet'}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Institution Dashboard</h2>
        <p className="text-gray-600 mb-6">
          {currentUser.name} - {currentUser.category} Department
        </p>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'open' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('open')}
            >
              Open ({openComplaints.length})
            </button>
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'inProgress' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('inProgress')}
            >
              In Progress ({inProgressComplaints.length})
            </button>
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'resolved' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({resolvedComplaints.length})
            </button>
          </div>
        </div>
        
        {activeTab === 'open' && displayComplaints(openComplaints)}
        {activeTab === 'inProgress' && displayComplaints(inProgressComplaints)}
        {activeTab === 'resolved' && displayComplaints(resolvedComplaints)}
      </div>
    </div>
  );
};

export default InstitutionDashboard;