import React, { useState, useEffect } from 'react';
import api from '../api';

const Admin = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints', { params: { status: 'Pending' } });
        setComplaints(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleSelect = (complaint) => {
    setSelected(complaint);
    setStatus(complaint.status || '');
    setNote('');
    setUpdateError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await api.put(`/complaints/${selected._id}`, { status, note });
      const response = await api.get('/complaints', { params: { status: 'Received' } });
      setComplaints(response.data);
      setSelected(null);
    } catch (err) {
      setUpdateError(err.response?.data?.error || err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading complaints...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">Error: {error}</div>;
  if (!complaints.length) return <div className="text-center mt-10 text-gray-600">No complaints found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Admin Dashboard</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Name</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c._id}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3">{c.citizen?.name}</td>
                <td className="p-3">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleSelect(c)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Complaint Details</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>ID:</strong> {selected._id}</p>
            <p><strong>Name:</strong> {selected.citizen.name}</p>
            <p><strong>Contact:</strong> {selected.citizen.contact}</p>
            <p><strong>Category:</strong> {selected.category}</p>
            <p><strong>Description:</strong> {selected.description}</p>
          </div>

          <h3 className="mt-6 font-semibold">History</h3>
          <ul className="mt-2 space-y-3 text-sm bg-gray-50 p-4 rounded">
            {selected.history.map((entry, idx) => (
              <li key={idx} className="border-b pb-2 last:border-none">
                <p><strong>Status:</strong> {entry.status}</p>
                <p><strong>Date:</strong> {new Date(entry.date).toLocaleString()}</p>
                <p><strong>Note:</strong> {entry.note}</p>
              </li>
            ))}
          </ul>

          <form onSubmit={handleUpdate} className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <input
                type="text"
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Note</label>
              <input
                type="text"
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={note}
                onChange={e => setNote(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
            {updateError && (
              <p className="text-red-500 text-sm mt-2">{updateError}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
