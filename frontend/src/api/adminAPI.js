import API from './axiosInstance';

export const getAllComplaints      = (params)          => API.get('/admin/complaints', { params });
export const updateStatus          = (id, data)        => API.put(`/admin/complaints/${id}/status`, data);
export const assignDepartment      = (id, data)        => API.put(`/admin/complaints/${id}/assign`, data);
export const uploadProof           = (id, formData)    => API.post(`/admin/complaints/${id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAnalytics          = ()                => API.get('/admin/analytics');
export const getAllUsers            = ()                => API.get('/admin/users');
export const toggleUser            = (id)              => API.put(`/admin/users/${id}/toggle`);
