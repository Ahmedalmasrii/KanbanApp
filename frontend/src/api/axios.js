import axios from "axios";

const api = axios.create({
  baseURL: "https://kanbanapp-u467.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const licenseKey = localStorage.getItem("licenseKey");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (licenseKey) {
    config.headers["x-license-key"] = licenseKey;
  }
  return config;
});

export default api;
