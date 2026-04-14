import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach token from localStorage on every request
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('civicfix_user') || 'null');
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (token expired) globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('civicfix_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
