import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin Reports
export const getAdminOverview = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/overview`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getUserGrowth = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/user-growth`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getEventsReport = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/events`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getApplicationsReport = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/applications`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getCertificatesReport = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/certificates`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getTopOrganizations = async () => {
    const response = await axios.get(`${API_URL}/admin/reports/top-organizations`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Organizer Reports
export const getOrganizerDashboardReport = async () => {
    const response = await axios.get(`${API_URL}/organizer/reports/dashboard`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getEventPerformanceReport = async (eventId) => {
    const response = await axios.get(`${API_URL}/organizer/reports/event/${eventId}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Shared Leaderboard
export const getLeaderboard = async () => {
    const response = await axios.get(`${API_URL}/reports/leaderboard`, {
        headers: getAuthHeader(),
    });
    return response.data;
};
