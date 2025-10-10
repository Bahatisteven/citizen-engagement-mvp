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

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Function to refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${baseURL}/auth/refresh-token`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('category');
    throw error;
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
    const originalRequest = error.config;

    // Handle 401 Unauthorized (expired access token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid retry for refresh-token endpoint itself
      if (originalRequest.url.includes('/auth/refresh-token')) {
        // Refresh token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('category');

        // Redirect to home page (which will show login)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Redirect to login page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      csrfToken = null; // Clear cached token

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
