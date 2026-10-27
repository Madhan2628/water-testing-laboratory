import axios from 'axios';
import { handleDemoFallback } from './demoFallback';

// Detect if running on a static cloud host like Vercel or GitHub Pages without custom backend URL
const isStaticHost =
  typeof window !== 'undefined' &&
  !import.meta.env.VITE_API_BASE_URL &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  adapter: async (config) => {
    // 1. If on static Vercel/GitHub Pages without a configured remote backend, use demo fallback directly
    if (isStaticHost) {
      const fallbackRes = handleDemoFallback(config);
      if (fallbackRes) {
        return fallbackRes;
      }
    }

    // 2. Otherwise execute live network request (local dev or remote Spring Boot server)
    try {
      const res = await defaultAdapter(config);
      // If server returned HTML (Vercel SPA rewrite fallback) instead of JSON for API
      if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE')) {
        const fallbackRes = handleDemoFallback(config);
        if (fallbackRes) return fallbackRes;
      }
      return res;
    } catch (err) {
      // If network error, 404, or 405 occurs on cloud static host
      const fallbackRes = handleDemoFallback(config);
      if (fallbackRes) {
        return fallbackRes;
      }
      throw err;
    }
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

// Response interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
