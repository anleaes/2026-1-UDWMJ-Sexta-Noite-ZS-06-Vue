import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // URL padrão do seu Django local
  withCredentials: true,            // Permite enviar e receber os cookies de sessão do Django
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor para injetar automaticamente o token CSRF do Django nas requisições de escrita
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;