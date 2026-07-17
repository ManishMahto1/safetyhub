import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize errors so callers get a consistent shape whether it's a network
// failure (offline) or a server error response.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ offline: true, message: 'Network unavailable' });
    }
    return Promise.reject({
      offline: false,
      status: error.response.status,
      message: error.response.data?.message || 'Something went wrong',
    });
  }
);
