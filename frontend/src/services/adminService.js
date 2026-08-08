import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/admin`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAdminDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getPendingEvents = async (status) => {
  const response = await axios.get(`${API_URL}/events/pending`, {
    params: status ? { status } : {},
    headers: getAuthHeader(),
  });
  return response.data;
};

export const approveEvent = async (id) => {
  const response = await axios.patch(`${API_URL}/events/${id}/approve`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const rejectEvent = async (id) => {
  const response = await axios.patch(`${API_URL}/events/${id}/reject`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getReports = async () => {
  const response = await axios.get(`${API_URL}/reports`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getSettings = async () => {
  const response = await axios.get(`${API_URL}/settings`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await axios.put(`${API_URL}/settings`, settingsData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/logs`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateAdminUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/users/${id}`, userData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/users/${id}/status`, { status }, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getOrganizations = async () => {
  const response = await axios.get(`${API_URL}/organizations`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getOrganizationById = async (id) => {
  const response = await axios.get(`${API_URL}/organizations/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAdminEvents = async () => {
  const response = await axios.get(`${API_URL}/events`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getCertificateStats = async () => {
  const response = await axios.get(`${API_URL}/certificates/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

