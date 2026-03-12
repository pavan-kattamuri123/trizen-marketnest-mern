import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api' 
      : 'https://trizen-marketnest-backend.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving refresh token cookies
});

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Wait, the backend returns 401 when the main access token is expired or invalid.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token via the httpOnly cookie
        const res = await api.post('/auth/refresh');
        
        // If successful, we can update the original request config (if we were using Bearer, but here we just rely on cookies mostly or local storage token).
        // Wait, the backend gets the new token. We should probably return it or the backend sends it in JSON.
        // Let's assume the new token is returned in res.data.accessToken and we store it in memory.
        
        // Actually, if we store the access token in Context/LocalStorage:
        const newAccessToken = res.data.accessToken;
        
        // For subsequent requests (if keeping it in headers):
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Dispatch custom event to notify React context about new token (so it can save it)
        window.dispatchEvent(new CustomEvent('accessTokenRefreshed', { detail: newAccessToken }));

        return api(originalRequest);
      } catch (err) {
        // If refresh token is also expired or invalid, log out the user
        window.dispatchEvent(new Event('refreshTokenExpired'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
