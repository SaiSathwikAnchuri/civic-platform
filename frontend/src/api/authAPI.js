import API from './axiosInstance';

export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);
export const getMe    = ()     => API.get('/auth/me');
export const updateMe = (data) => API.put('/auth/me', data);
