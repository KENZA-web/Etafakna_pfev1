import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Token automatique (inchangé)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse avec retry sur 500
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 500) {
      // Réessaie une seule fois après 500 ms
      const config = error.config;
      if (!config._retry) {
        config._retry = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        return api.request(config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;