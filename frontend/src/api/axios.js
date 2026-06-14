import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Skip token for auth endpoints
const PUBLIC_URLS = ['/users/auth/login/', '/users/auth/register/', '/users/auth/refresh/'];

api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_URLS.some(url => config.url?.includes(url));
  if (!isPublic) {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isPublic = PUBLIC_URLS.some(url => original.url?.includes(url));
    if (error.response?.status === 401 && !original._retry && !isPublic) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://127.0.0.1:8000/api/users/auth/refresh/',
          { refresh }
        );
        localStorage.setItem('authToken', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        // delete api.defaults.headers.Authorization;
        window.location.href = '/loginPortal';
      }
    }
    return Promise.reject(error);
  }
);

export default api;