import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err.response) return "Cannot reach the server. Make sure the backend is running.";
  const data = err.response.data;
  return data?.message || (data?.errors && Object.values(data.errors)[0]?.[0]) || fallback;
}

export default api;