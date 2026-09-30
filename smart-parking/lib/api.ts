import axios from 'axios';

function computeBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    // If the page is served from a LAN IP (mobile scenario), point the API
    // to the same host on port 8080 instead of forcing localhost.
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `${protocol}//${host}:8080`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}

const api = axios.create({
  baseURL: computeBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Recompute on every request — handles hostname changes after hot reload
    config.baseURL = computeBaseUrl();
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'role=; path=/; max-age=0';
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
