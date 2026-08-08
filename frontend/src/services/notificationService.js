import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/notifications`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch notifications (for student / organizer)
export const getNotifications = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Get unread notification counts
export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await axios.put(
    `${API_URL}/read-all`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Fetch admin notifications
export const getAdminNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/notifications`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
