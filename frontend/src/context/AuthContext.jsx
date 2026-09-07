import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ciphershield_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ciphershield_token");
    if (token && user) {
      connectSocket(token);
    }
    setLoading(false);
    return () => disconnectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ciphershield_token", data.token);
    localStorage.setItem("ciphershield_user", JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.token);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("ciphershield_token", data.token);
    localStorage.setItem("ciphershield_user", JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ciphershield_token");
    localStorage.removeItem("ciphershield_user");
    disconnectSocket();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
