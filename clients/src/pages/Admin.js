/**
 * this is how i want the admin dashboard to look like
 * 
 *
 * - view and monitor all complaints:
 *   • real‐time list of citizen submissions with filters for status and category.
 *   • drill into individual complaint details, including history.
 *
 * - approve instution sign‐ups:
 *   • review pending institution sign‐ups to verify legitimate agencies.
 *   • approve or reject each application; approved institutions gain access to their departmental dashboard.
 *
 * - revoke or revert access:
 *   •in case of an incorrect approval (e.g., a citizen was mistakenly granted institution rights),
 *     revoke the institution’s status and revert their role in the database.
 *   • maintain an audit log of all approval and reversal actions for accountability.
 *
 * - manage compliant lifecycle:
 *   • update complaint statuses on behalf of any agency.
 *   • add notes or reassign complaints to other departments as needed.
 * 
 *
 * NOTE: due to project time constraints, these admin workflows remain design prototypes.
 * 
 * 
 * future iterations will implement role-based routing, email notifications on approval/rejection,
 * and a complete audit trail of admin actions.
 */




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// admin dashboard component: fetches and displays all complaints
const Admin = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');       // current status filter
  const [searchTerm, setSearchTerm] = useState('');  // current search text

  // fetch all complaints when component mounts
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/admin/complaints', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setComplaints(response.data);
      } catch (err) {
        console.error('error fetching complaints:', err);
      }
    };
    fetchComplaints();
  }, []);

  // filter and search logic for displaying complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filter === 'all' || complaint.status === filter;
    const matchesSearch = searchTerm === '' ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // summary counts for dashboard cards
  const totalComplaints      = complaints.length;
  const openComplaints       = complaints.filter(c => c.status === 'Open').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedComplaints   = complaints.filter(c => c.status === 'Resolved').length;

  // calculate top categories by count
  const categoryCounts = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="container mx-auto p-4">
      {/* header */}
      <h2 className="text-2xl font-bold mb-6">admin dashboard</h2>

      {/* overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">total complaints</p>
          <p className="text-2xl font-bold">{totalComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">open</p>
          <p className="text-2xl font-bold text-yellow-600">{openComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">in progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">resolved</p>
          <p className="text-2xl font-bold text-green-600">{resolvedComplaints}</p>
        </div>
      </div>

      {/* recent complaints list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">recent complaints</h3>
          <div className="space-y-3">
            {complaints
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map(c => (
                <div 
                  key={c.id}
                  className="border-b pb-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/complaint/${c.id}`)}
                >
                  {/* each recent complaint */}
                  <div className="flex justify-between">
                    <p className="font-medium">{c.title}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.status === 'Open'             ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'In Progress'      ? 'bg-blue-100 text-blue-800' :
                      /* resolved */                  'bg-green-100 text-green-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">id: {c.id} | {c.createdAt}</p>
                </div>
            ))}
          </div>
        </div>

        {/* top categories widget */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">top categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span>{cat.name}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* all complaints table with filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">all complaints</h3>

        {/* filter & search controls */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>all</button>
            <button onClick={() => setFilter('Open')} className={`px-3 py-1 rounded ${filter === 'Open' ? 'bg-yellow-200' : 'bg-yellow-100 hover:bg-yellow-200'}`}>open</button>
            <button onClick={() => setFilter('In Progress')} className={`px-3 py-1 rounded ${filter === 'In Progress' ? 'bg-blue-200' : 'bg-blue-100 hover:bg-blue-200'}`}>in progress</button>
            <button onClick={() => setFilter('Resolved')} className={`px-3 py-1 rounded ${filter === 'Resolved' ? 'bg-green-200' : 'bg-green-100 hover:bg-green-200'}`}>resolved</button>
          </div>
          <input
            type="text"
            placeholder="search complaints..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* complaints table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">id</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">title</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">category</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">date</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      c.status === 'Open'        ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      /* resolved */             'bg-green-100 text-green-800'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button onClick={() => navigate(`/complaint/${c.id}`)} className="text-blue-600 hover:text-blue-900">
                      view
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* no complaints fallback */}
        {filteredComplaints.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">no complaints found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
