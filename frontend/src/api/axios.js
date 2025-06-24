import axios from "axios";
import licenseMap from "../utils/licenseMap"; // Importera vår map

const path = window.location.pathname.toLowerCase();

// Om licens inte finns, sätt baserat på path
if (!localStorage.getItem("licenseKey")) {
  const key = licenseMap[path];
  if (key) {
    localStorage.setItem("licenseKey", key);
  }
}

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Lokalt
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
