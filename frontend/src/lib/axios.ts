import axios from 'axios';

// Base API URL:
// - If NEXT_PUBLIC_BACKEND_URL is set, use it directly (both client & SSR)
// - Fallback to /api (for Next.js rewrites proxy in local dev)
const getBaseUrl = () => {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend && backend.trim()) {
    return `${backend.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const API_BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds (allows large media sync)
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
