import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Submit = () => {
  const { addComplaint, getCategories } = React.useContext(AppContext);
  const navigate = useNavigate();

  // 1) hold categories in state
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 2) load categories once on mount
  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();   // async call
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    })();
  }, [getCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const newComplaint = await addComplaint({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        image: null,
      });

      setTimeout(() => {
        navigate(`/complaint/${newComplaint.id}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to submit complaint');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Submit a Complaint or Feedback</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Your complaint has been submitted successfully! You will be redirected shortly.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of your complaint"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              required
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 mb-2">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.location}
              onChange={handleChange}
              placeholder="Address or location of the issue (if applicable)"
            />
          </div>

          {/* Image */}
          <div className="mb-6">
            <label htmlFor="image" className="block text-gray-700 mb-2">
              Attach Image (optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleImageChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default Submit;