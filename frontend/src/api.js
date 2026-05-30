import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('task_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized API error mapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token has expired or is invalid, automatically clear session
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('task_tracker_token');
      localStorage.removeItem('task_tracker_user');
      // If we are not already on the login page, redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Extract server error message if available
    const serverMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({
      status: error.response?.status || 500,
      message: serverMessage,
      errors: error.response?.data?.errors || null,
      raw: error
    });
  }
);

export default api;
