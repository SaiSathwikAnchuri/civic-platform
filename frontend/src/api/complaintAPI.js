import API from './axiosInstance';

export const submitComplaint  = (formData) => API.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyComplaints  = (params)   => API.get('/complaints/my', { params });
export const getComplaintById = (id)       => API.get(`/complaints/${id}`);
export const upvoteComplaint  = (id)       => API.post(`/complaints/${id}/upvote`);
