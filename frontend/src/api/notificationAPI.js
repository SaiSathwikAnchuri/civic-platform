import API from './axiosInstance';

export const getNotifications = ()     => API.get('/notifications');
export const markRead         = (ids)  => API.put('/notifications/read', { ids });
export const deleteNotif      = (id)   => API.delete(`/notifications/${id}`);
