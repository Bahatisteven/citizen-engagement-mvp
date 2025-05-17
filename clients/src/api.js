import axios from 'axios';

const base = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: `${base}/api`,
});

export default api;