import axios from 'axios';

// Base API URL:
// - Client-side: use relative path so Next.js rewrites proxy to backend
// - Server-side (SSR): use absolute backend URL
const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api'
    : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') + '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds (Vercel cold starts can be slow)
});

// ============================================================
// Request Interceptor: Attach JWT token from localStorage
// ============================================================
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('umkm_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor: Handle 401/403 globally
// ============================================================
const clearAuthAndRedirect = () => {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem('umkm_token');
  localStorage.removeItem('umkm_user');

  // Clear cookies
  document.cookie = 'umkm_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie = 'umkm_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';

  // Redirect to login with expired flag (only from protected pages)
  const currentPath = window.location.pathname;
  const isProtected =
    currentPath.startsWith('/admin') || currentPath.startsWith('/superadmin');
  if (isProtected) {
    window.location.href = '/login?expired=1';
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401 Unauthorized — token missing or no longer valid
      // 403 Forbidden — token invalid/expired (backend returns 403 for bad JWT)
      if (status === 401 || status === 403) {
        const message = error.response.data?.message || '';
        // Only clear auth if the error is actually about the token
        const isTokenError =
          message.includes('token') ||
          message.includes('Token') ||
          message.includes('kadaluarsa') ||
          message.includes('otentikasi') ||
          status === 401;

        if (isTokenError) {
          clearAuthAndRedirect();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
