import { useState } from "react";
import api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post("/login", { username, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/logout"); } catch {}
    localStorage.clear();
    setUser(null);
  };

  return { user, login, logout };
}