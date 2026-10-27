import axios from 'axios';
import { handleDemoFallback } from './demoFallback';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wtlms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401 & graceful demo fallback for static hosts like Vercel
api.interceptors.response.use(
  (response) => {
    // If static hosting returned HTML instead of JSON for an API call, divert to demo fallback
    if (
      typeof response.data === 'string' &&
      response.data.includes('<!DOCTYPE') &&
      response.config.url &&
      !response.config.url.endsWith('.html')
    ) {
      const fallback = handleDemoFallback(response.config);
      if (fallback) return fallback;
    }
    return response;
  },
  (error) => {
    // If backend is not reached (e.g. on Vercel static deployment without remote backend URL)
    const isUnreachable =
      error.response?.status === 404 ||
      error.code === 'ERR_NETWORK' ||
      !error.response ||
      (typeof error.response?.data === 'string' && error.response?.data.includes('<!DOCTYPE'));

    if (isUnreachable) {
      const fallback = handleDemoFallback(error.config);
      if (fallback) {
        return Promise.resolve(fallback);
      }
    }

    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('wtlms_token');
        localStorage.removeItem('wtlms_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
