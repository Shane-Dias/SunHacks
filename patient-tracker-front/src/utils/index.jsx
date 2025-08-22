import axios from 'axios';

export const customFetch = axios.create({
  baseURL: 'https://localhost:3000/api',
});

export const customFetchNoToken = axios.create({
  baseURL: 'https://localhost:3000/api',
});

// Add token to requests
customFetch.interceptors.request.use(
  (config) => {
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

// Handle token expiration
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);