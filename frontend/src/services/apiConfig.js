/**
 * Centralized API Base URL Configuration for Local Development & Vercel Production Deployment.
 * Uses VITE_API_BASE_URL environment variable when available.
 */
const getApiBaseUrl = () => {
  // Auto-detect local development (Vite dev mode or localhost hostname)
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.includes("localhost")) {
      return envUrl.trim().replace(/\/$/, "");
    }
    return "http://localhost:5000";
  }

  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, "");
  }

  // Default to deployed Render backend URL for production
  return "https://volunteer-management-system-2.onrender.com";
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
