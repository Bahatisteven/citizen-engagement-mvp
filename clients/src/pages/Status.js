import React, { useState } from 'react';
import api from '../api';

const Status = () => {
  const [ticketId, setTicketId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaint = async () => {
    setLoading(true);
    setError(null);
    setComplaint(null);
    try {
      const res = await api.get(`/complaints/${ticketId}`);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Check Complaint Status</h1>

      {/* Input Form */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="Enter Ticket ID"
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchComplaint}
          disabled={loading || !ticketId.trim()}
          className={`px-4 py-2 rounded text-white ${
            loading || !ticketId.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Loading...' : 'Check Status'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Complaint Details */}
      {complaint && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <p className="text-lg"><span className="font-medium">Ticket ID:</span> {complaint._id}</p>
          <p><span className="font-medium">Status:</span> <span className="text-blue-600">{complaint.status}</span></p>
          <p><span className="font-medium">Category:</span> {complaint.category}</p>
          <p><span className="font-medium">Description:</span> {complaint.description}</p>

          <h2 className="text-xl font-semibold mt-4">History</h2>
          <ul className="space-y-3">
            {complaint.history.map((entry, idx) => (
              <li key={idx} className="border rounded p-3 bg-gray-50">
                <p><span className="font-medium">Action:</span> {entry.action || entry.status}</p>
                <p><span className="font-medium">Date:</span> {new Date(entry.timestamp || entry.date).toLocaleString()}</p>
                {entry.notes && <p><span className="font-medium">Note:</span> {entry.notes || entry.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Status;
