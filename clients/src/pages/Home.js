import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Home = () => {
  const { complaints } = React.useContext(AppContext);
  const [topCategories, setTopCategories] = useState([]);
  const [recentResolved, setRecentResolved] = useState([]);
  
  useEffect(() => {
    const categories = {};
    complaints.forEach(complaint => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
    
    setTopCategories(sortedCategories);
    
    const resolved = complaints
      .filter(c => c.status === 'Resolved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    setRecentResolved(resolved);
  }, [complaints]);

  return (
    <div className="container mx-auto p-4">
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to CitizenVoice</h1>
          <p className="text-xl mb-6">Your platform for submitting complaints and feedback to improve public services.</p>
          <div className="flex space-x-4">
            <Link to="/submit" className="bg-white text-blue-700 px-6 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors">Submit a Complaint</Link>
            <Link to="/status" className="bg-blue-700 text-white border border-white px-6 py-2 rounded-md font-medium hover:bg-blue-800 transition-colors">Track Complaint Status</Link>
          </div>
        </div>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Top Issue Categories</h2>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{category.name}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{category.count} reports</span>
              </div>
            ))}
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Recently Resolved Issues</h2>
          <div className="space-y-4">
            {recentResolved.map(complaint => (
              <div key={complaint.id} className="border-b pb-2">
                <p className="font-medium">{complaint.title}</p>
                <p className="text-sm text-gray-600">Resolved on {complaint.responses[complaint.responses.length-1]?.date || 'N/A'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;