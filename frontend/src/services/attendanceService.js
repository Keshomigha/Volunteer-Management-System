import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/attendance`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAttendanceStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await axios.get(`${API_URL}/my-attendance`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAttendeesForEvent = async (eventId) => {
  const response = await axios.get(`${API_URL}/event/${eventId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const markAttendance = async (attendanceData) => {
  const response = await axios.post(`${API_URL}/mark`, attendanceData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const bulkMarkAttendance = async (eventId, records) => {
  const response = await axios.post(
    `${API_URL}/bulk-mark`,
    { eventId, records },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getAttendanceById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
