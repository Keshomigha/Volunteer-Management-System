import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/auth`;

export const registerStudent = async (userData) => {
  const response = await axios.post(`${API_URL}/register/student`, userData);
  return response.data;
};

export const registerOrganizer = async (userData) => {
  const response = await axios.post(`${API_URL}/register/organizer`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const getUserProfile = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email }, { timeout: 30000 });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp }, { timeout: 30000 });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password/${token}`, { newPassword });
  return response.data;
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password-otp`, { email, otp, newPassword });
  return response.data;
};

export const googleLogin = async (idToken, targetRole = "student") => {
  const response = await axios.post(`${API_URL}/google-login`, { idToken, targetRole });
  return response.data;
};

export const googleRegisterOrganizer = async (idToken, organizationName, phone) => {
  const response = await axios.post(`${API_URL}/google-register/organizer`, { idToken, organizationName, phone });
  return response.data;
};

