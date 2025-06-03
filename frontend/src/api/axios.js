import axios from "axios"; // Importerar axios för HTTP-anrop

// Skapar en axios-instans med grundläggande konfiguration
const instance = axios.create({
  // Bas-URL för alla anrop (ändra till din produktionsserver vid behov)
  baseURL: "https://kanbanapp-u467.onrender.com/api",
  headers: {
    "Content-Type": "application/json", // Alla anrop skickar JSON
  },
});

// Interceptor som automatiskt lägger till JWT-token i varje anrop
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Hämta token från localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Lägg till i Authorization-headern
  }
  return config;
});

export default instance; // Exporterar instansen för användning i projektet
