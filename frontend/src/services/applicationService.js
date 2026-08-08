import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/applications`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Student applies for an event
export const applyToEvent = async (eventId, formData) => {
  const response = await axios.post(
    API_URL,
    { eventId, formData },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Student retrieves their own applications
export const getMyApplications = async () => {
  const response = await axios.get(`${API_URL}/my-applications`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer retrieves statistics
export const getApplicationStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer retrieves applications for a specific event
export const getOrganizerApplications = async (eventId) => {
  const response = await axios.get(`${API_URL}/event/${eventId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer approves application
export const approveApplication = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/approve`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Organizer rejects application
export const rejectApplication = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/reject`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Retrieve application details by ID
export const getApplicationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer retrieves all applications across all their events
export const getOrganizerAllApplications = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/volunteers/applications`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
