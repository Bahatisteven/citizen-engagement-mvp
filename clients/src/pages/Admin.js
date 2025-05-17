import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Admin = () => {
  const { complaints } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filter === 'all' || complaint.status === filter;
    const matchesSearch =
      searchTerm === '' || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  
  const categoryCounts = {};
  complaints.forEach(complaint => {
    categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
  });
  
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Complaints</p>
          <p className="text-2xl font-bold">{totalComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-2xl font-bold text-yellow-600">{openComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressComplaints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{resolvedComplaints}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {complaints
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map(complaint => (
                <div 
                  key={complaint.id}
                  className="border-b pb-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/complaint/${complaint.id}`)}
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{complaint.title}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      complaint.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {complaint.id} | {complaint.createdAt}</p>
                </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">All Complaints</h3>
        
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('Open')}
              className={`px-3 py-1 rounded ${filter === 'Open' ? 'bg-yellow-200' : 'bg-yellow-100 hover:bg-yellow-200'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter('In Progress')}
              className={`px-3 py-1 rounded ${filter === 'In Progress' ? 'bg-blue-200' : 'bg-blue-100 hover:bg-blue-200'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setFilter('Resolved')}
              className={`px-3 py-1 rounded ${filter === 'Resolved' ? 'bg-green-200' : 'bg-green-100 hover:bg-green-200'}`}
            >
              Resolved
            </button>
          </div>
          
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search complaints..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/complaint/${complaint.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredComplaints.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No complaints found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;