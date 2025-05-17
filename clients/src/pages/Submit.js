import React, { useState } from 'react';
import api from '../api';

const categories = ['Road', 'Water', 'Electricity', 'Health', 'Other'];

const Submit = () => {
  const [form, setForm] = useState({
    title: '',
    name: '',
    contact: '',
    category: '',
    description: '',
  });
  const [ticketId, setTicketId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTicketId(null);
    setLoading(true);

    const payload = {
      title:       form.title,
      description: form.description,
      category:    form.category,
      citizen: {
        name:    form.name,
        contact: form.contact,
      }
    };

    try {
      const { data } = await api.post('/complaints', payload);
      setTicketId(data.id);
      // reset form
      setForm({ title: '', name: '', contact: '', category: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Submit a Complaint</h1>

      {ticketId && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded text-green-800">
          Your ticket has been submitted! <strong>ID: {ticketId}</strong>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Issue Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* citizen name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* contact */}
        <div>
          <label htmlFor="contact" className="block text-sm font-medium mb-1">
            Contact (Email or Phone)
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            value={form.contact}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* submit button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full max-w-xs px-4 py-2 rounded text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Submit;
