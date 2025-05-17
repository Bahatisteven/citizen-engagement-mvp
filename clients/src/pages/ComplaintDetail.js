import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ComplaintDetail = () => {
  const { complaints, addResponse, updateComplaintStatus, currentUser, getUserById } = React.useContext(AppContext);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState('');
  const { complaintId } = useParams();
  
  const complaint = complaints.find(c => c.id === complaintId);
  const canRespond = currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.role === 'institution' && currentUser.id === complaint?.assignedTo) ||
    (currentUser.role === 'citizen' && currentUser.id === complaint?.citizen)
  );
  
  const canChangeStatus = currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.role === 'institution' && currentUser.id === complaint?.assignedTo)
  );
  
  const handleSubmitResponse = (e) => {
    e.preventDefault();
    setError('');
    
    if (!responseText.trim()) {
      setError('Response cannot be empty');
      return;
    }
    
    addResponse(complaintId, responseText);
    setResponseText('');
  };
  
  const handleStatusChange = (status) => {
    updateComplaintStatus(complaintId, status);
  };
  
  if (!complaint) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Complaint not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{complaint.title}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            complaint.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
            complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {complaint.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">ID</p>
            <p className="font-medium">{complaint.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date Submitted</p>
            <p>{complaint.createdAt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p>{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted By</p>
            <p>{getUserById(complaint.citizen)?.name || 'Unknown'}</p>
          </div>
          {complaint.location && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Location</p>
              <p>{complaint.location}</p>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Description</p>
          <div className="bg-gray-50 p-4 rounded">{complaint.description}</div>
        </div>
        
        {canChangeStatus && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Update Status</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleStatusChange('Open')}
                className={`px-4 py-2 rounded ${complaint.status === 'Open' ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-yellow-100'}`}
              >
                Open
              </button>
              <button 
                onClick={() => handleStatusChange('In Progress')}
                className={`px-4 py-2 rounded ${complaint.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
              >
                In Progress
              </button>
              <button 
                onClick={() => handleStatusChange('Resolved')}
                className={`px-4 py-2 rounded ${complaint.status === 'Resolved' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
              >
                Resolved
              </button>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Responses and Updates</h3>
          {complaint.responses.length > 0 ? (
            <div className="space-y-4 mb-6">
              {complaint.responses.map((response, index) => {
                const responder = getUserById(response.from);
                const isInstitution = responder?.role === 'institution';
                
                return (
                  <div key={index} className={`p-4 rounded-lg ${isInstitution ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                    <p>{response.text}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-600">From: {responder?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{response.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-6">No responses yet</p>
          )}
          
          {canRespond && (
            <div>
              <h4 className="font-medium mb-2">Add Response</h4>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              <form onSubmit={handleSubmitResponse}>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows="3"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                  required
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Submit Response
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;