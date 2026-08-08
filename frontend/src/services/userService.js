import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/volunteers`;
const ORGANIZER_API_URL = `${API_BASE_URL}/api/organizer`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch authenticated student's dashboard details (statistics, joined events, certificates, hours, reputation).
 */
export const getStudentDashboard = async () => {
    const response = await axios.get(`${API_URL}/student-dashboard`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Fetch student profile settings.
 */
export const getStudentSettings = async () => {
    const response = await axios.get(`${API_URL}/settings`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Save student profile settings.
 */
export const updateStudentSettings = async (data) => {
    const response = await axios.put(`${API_URL}/settings`, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Change student password.
 */
export const changePassword = async (data) => {
    const response = await axios.put(`${API_URL}/change-password`, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Fetch organizer profile settings.
 */
export const getOrganizerSettings = async () => {
    const response = await axios.get(`${ORGANIZER_API_URL}/settings`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Save organizer profile settings.
 */
export const updateOrganizerSettings = async (data) => {
    const response = await axios.put(`${ORGANIZER_API_URL}/settings`, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};

/**
 * Change organizer password.
 */
export const changeOrganizerPassword = async (data) => {
    const response = await axios.put(`${ORGANIZER_API_URL}/change-password`, data, {
        headers: getAuthHeader(),
    });
    return response.data;
};
