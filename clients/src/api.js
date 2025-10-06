import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies for CSRF token
});

// CSRF token cache
let csrfToken = null;

// Function to fetch CSRF token
const fetchCSRFToken = async () => {
  try {
    const response = await axios.get(`${baseURL}/auth/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      // Fetch CSRF token if not cached
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If CSRF token is invalid, refetch and retry
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      csrfToken = null; // Clear cached token
      const originalRequest = error.config;

      if (!originalRequest._retryCSRF) {
        originalRequest._retryCSRF = true;
        await fetchCSRFToken();
        if (csrfToken) {
          originalRequest.headers['X-CSRF-Token'] = csrfToken;
          return api(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
