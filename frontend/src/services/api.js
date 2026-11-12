import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roadassist_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Auto logout on 401 if token was expired
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('roadassist_token');
      localStorage.removeItem('roadassist_user');
      window.location.href = '/login?expired=1';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
