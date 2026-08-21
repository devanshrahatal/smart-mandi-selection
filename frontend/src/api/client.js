/**
 * Axios API client instance for Admin Dashboard and Public API requests.
 * Automatically attaches Authorization Bearer token from localStorage.
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://smart-mandi-selection.onrender.com" : "http://localhost:8000");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smart_mandi_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token
      localStorage.removeItem("smart_mandi_token");
      localStorage.removeItem("smart_mandi_user");
      // Redirect if on any protected dashboard or map route
      const currentPath = window.location.pathname;
      const isProtectedPath =
        currentPath.startsWith("/admin") || currentPath === "/map" || currentPath === "/pooling";
      if (isProtectedPath && currentPath !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);
