import React, { useState } from 'react';
import { AppContext } from '../context/AppContext';

const Status = () => {
  const { complaints, getUserById } = React.useContext(AppContext);
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setComplaint(null);
    
    const found = complaints.find(c => c.id === complaintId);
    if (found) {
      setComplaint(found);
    } else {
      setError('No complaint found with that ID');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Check Complaint Status</h2>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter complaint ID (e.g., C001)"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-r-md hover:bg-blue-700 transition duration-300"
            >
              Check Status
            </button>
          </div>
        </form>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        {complaint && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{complaint.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                complaint.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {complaint.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p>{complaint.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Submitted</p>
                <p>{complaint.createdAt}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="mt-1">{complaint.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Responses and Updates</h4>
              {complaint.responses.length > 0 ? (
                <div className="space-y-3">
                  {complaint.responses.map((response, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p>{response.text}</p>
                      <p className="text-sm text-gray-500 mt-1">From: {getUserById(response.from)?.name || response.from} - {response.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No responses yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;