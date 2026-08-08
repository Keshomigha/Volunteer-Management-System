import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/events`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all events (public)
export const getEvents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single event by ID (public)
export const getEventById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create event (organizer only)
export const createEvent = async (eventData) => {
  const response = await axios.post(API_URL, eventData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Update event (organizer only)
export const updateEvent = async (id, eventData) => {
  const response = await axios.put(`${API_URL}/${id}`, eventData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Delete event (organizer only)
export const deleteEvent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Get organizer's own events
export const getMyEvents = async () => {
  const response = await axios.get(`${API_URL}/my-events`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Get organizer dashboard stats (organizer only)
export const getOrganizerDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/organizer/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
