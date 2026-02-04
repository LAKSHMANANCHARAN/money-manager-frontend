import axios from "axios";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://money-manager-backend-production-32ba.up.railway.app",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export default API;