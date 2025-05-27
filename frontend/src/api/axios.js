// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default instance;
import axios from "axios";

const instance = axios.create({
  baseURL: "https://kanbanapp-u467.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Lägg till token automatiskt i alla requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
