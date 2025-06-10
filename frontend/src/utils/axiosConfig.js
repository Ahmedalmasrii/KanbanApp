import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const licenseKey = localStorage.getItem('licenseKey');
  if (licenseKey) {
    config.headers['x-license-key'] = licenseKey;
  }
  return config;
});

export default api;
