import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/certificates`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Student: get own certificates
export const getMyCertificates = async () => {
  const response = await axios.get(`${API_URL}/my-certificates`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer: eligible checklist
export const getEligibleVolunteers = async (eventId) => {
  const response = await axios.get(`${API_URL}/eligible/${eventId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer: generate certificate
export const generateCertificate = async (eventId, userId, hours) => {
  const response = await axios.post(
    `${API_URL}/generate`,
    { eventId, userId, hours },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Backwards compatibility / Revoke certificate
export const revokeCertificate = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Download certificate (url endpoint)
export const getCertificateDownloadUrl = (id) => {
  return `${API_URL}/${id}/download`;
};

// Download certificate as blob PDF
export const downloadCertificatePdf = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/download`, {
    headers: getAuthHeader(),
    responseType: 'blob',
  });
  return response.data;
};

// Organizer: get certificate dashboard (analytics, pending, generated lists)
export const getOrganizerCertificates = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Organizer: bulk generate certificates
export const generateBulkCertificates = async (eventId, volunteers) => {
  const response = await axios.post(
    `${API_URL}/generate-bulk`,
    { eventId, volunteers },
    { headers: getAuthHeader() }
  );
  return response.data;
};
