/**
 * Authentication Context Provider.
 * Manages admin user state, JWT tokens, and login/logout lifecycles.
 */

import React, { createContext, useState, useEffect } from "react";
import { apiClient } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on load
    const savedToken = localStorage.getItem("smart_mandi_token");
    const savedUser = localStorage.getItem("smart_mandi_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("smart_mandi_token");
        localStorage.removeItem("smart_mandi_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await apiClient.post("/api/admin/login", {
      username,
      password,
    });
    const { access_token, user: userData } = response.data;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem("smart_mandi_token", access_token);
    localStorage.setItem("smart_mandi_user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smart_mandi_token");
    localStorage.removeItem("smart_mandi_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
