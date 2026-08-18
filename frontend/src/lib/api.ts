import axiosInstance from './axios';
import { UMKM, UMKMProduct, Feedback, DynamicContent, UserAdmin } from './types';

// ============================================================
// Helper: Extract error message from response
// ============================================================
const extractError = (e: any, defaultMsg: string): string => {
  const err = e.response?.data?.error || e.response?.data?.message || e.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') return err.message || JSON.stringify(err);
  return defaultMsg;
};

// ============================================================
// Helper: Set cookie (for middleware auth check)
// ============================================================
const setCookie = (name: string, value: string, days = 1) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ============================================================
// Helper: Clean and extract Google Maps embed URL
// ============================================================
export const parseGmapsEmbedUrl = (input?: string, fallbackQuery?: string): string => {
  if (!input || !input.trim()) {
    if (fallbackQuery && fallbackQuery.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&output=embed`;
    }
    return '';
  }

  let text = input.trim();

  // If full HTML <iframe ... src="..." ...> was pasted
  const srcMatch = text.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    text = srcMatch[1];
  }

  // Remove leading/trailing quotes or extra slashes
  text = text.replace(/^['"]|['"]$/g, '').trim();

  // If it's already a valid embed URL
  if (text.includes('google.com/maps/embed') || text.includes('output=embed')) {
    return text;
  }

  // If it's a standard Google Maps link
  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const url = new URL(text);
      const q = url.searchParams.get('q') || url.searchParams.get('query');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      }
    } catch {}

    if (text.includes('google.com/maps')) {
      return `${text}${text.includes('?') ? '&' : '?'}output=embed`;
    }
  }

  // Fallback query if valid
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&output=embed`;
  }

  return text;
};

// ============================================================
// Normalizer: Convert raw backend data to frontend UMKM type
// ============================================================
export const normalizeUmkm = (raw: any): UMKM => {
  const gmapsRaw = raw.gmapsEmbed || '';
  const gmapsEmbedParsed = parseGmapsEmbedUrl(
    gmapsRaw,
    `${raw.name || ''} ${raw.address || ''} Korowelang Kulon Kendal`
  );

  return {
    id: raw.id,
    name: raw.name || '',
    owner: raw.owner || raw.ownerName || '',
    category: typeof raw.category === 'string' ? raw.category : (raw.category?.name || 'Kuliner'),
    address: raw.address || '',
    phone: raw.phone || raw.whatsappNumber || raw.whatsapp || '',
    whatsapp: raw.whatsapp || raw.whatsappNumber || raw.phone || '',
    gmapsUrl: raw.gmapsUrl || raw.mapsUrl || '',
    gmapsEmbed: gmapsEmbedParsed,
    description: raw.description || '',
    landingText: raw.landingText || raw.description || '',
    profileImage: raw.profileImage || raw.imageUrl || '',
    bannerImage: raw.bannerImage || raw.imageUrl || '',
    rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating || '5.0'),
    reviewCount: raw.reviewCount || 0,
    isHalal: Boolean(raw.isHalal || raw.is_halal),
    halalNumber: raw.halalNumber || raw.halal_number || '',
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications
      : (typeof raw.certifications === 'string' && raw.certifications.startsWith('[')
        ? JSON.parse(raw.certifications)
        : []),
    createdAt: raw.createdAt || new Date().toISOString(),
    products: (raw.products || []).map((p: any) => ({
      id: p.id,
      umkmId: p.umkmId || raw.id,
      name: p.name || p.title || '',
      price: Number(p.price) || 0,
      unit: p.unit || 'pcs',
      description: p.description || '',
      image: p.image || p.imageUrl || '',
      isHalal: Boolean(p.isHalal || p.is_halal),
      halalNumber: p.halalNumber || p.halal_number || '',
    })),
  };
};

// ============================================================
// PUBLIC API — No authentication required
// ============================================================

export const fetchUmkms = async (search?: string, category?: string): Promise<UMKM[]> => {
  try {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category && category !== 'Semua') params.category = category;

    const res = await axiosInstance.get('/public/umkm', { params });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeUmkm);
    }
  } catch (e) {
    console.warn('fetchUmkms error:', e);
  }
  return [];
};

export const fetchUmkmById = async (id: number | string): Promise<UMKM | null> => {
  try {
    const res = await axiosInstance.get(`/public/umkm/${id}`);
    if (res.data && res.data.data) {
      return normalizeUmkm(res.data.data);
    }
  } catch (e) {
    console.warn('fetchUmkmById error:', e);
  }
  return null;
};

export const fetchDynamicContent = async (): Promise<DynamicContent | null> => {
  try {
    const res = await axiosInstance.get('/public/konten');
    if (res.data && res.data.data) return res.data.data;
  } catch (e) {
    console.warn('fetchDynamicContent error:', e);
  }
  return null;
};

export const sendFeedback = async (name: string, email: string, message: string) => {
  try {
    const res = await axiosInstance.post('/public/feedback', { name, email, message });
    return res.data;
  } catch (e: any) {
    const errMsg = extractError(e, 'Gagal mengirim feedback.');
    return { success: false, message: errMsg };
  }
};

// ============================================================
// AUTH API
// ============================================================

export const loginAdmin = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });

    if (res.data && res.data.token) {
      const { token, user } = res.data;

      // Save to localStorage (for axios interceptor)
      if (typeof window !== 'undefined') {
        localStorage.setItem('umkm_token', token);
        localStorage.setItem('umkm_user', JSON.stringify(user));
      }

      // CRITICAL: Also save to cookie so Next.js middleware can read it
      setCookie('umkm_token', token, 1); // 1 day
      setCookie('umkm_user', JSON.stringify(user), 1);

      return { success: true, token, user };
    }

    return {
      success: false,
      message: res.data?.message || res.data?.error || 'Login gagal.',
    };
  } catch (e: any) {
    if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED' || e.message?.includes('Network')) {
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server backend. Pastikan backend berjalan.',
      };
    }
    const errMsg = e.response?.data?.message || e.response?.data?.error;
    return {
      success: false,
      message: typeof errMsg === 'string' ? errMsg : 'Login gagal. Periksa email & password.',
    };
  }
};

export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('umkm_token');
    localStorage.removeItem('umkm_user');
  }
  deleteCookie('umkm_token');
  deleteCookie('umkm_user');
};

export const fetchUserProfile = async (): Promise<{ success: boolean; data?: UserAdmin; error?: string }> => {
  try {
    const res = await axiosInstance.get('/admin/profile');
    if (res.data && res.data.data) {
      const u = res.data.data;
      const userAdmin: UserAdmin = {
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'admin',
        phone: u.phone || '',
        avatar: u.avatar || '',
        bio: u.bio || '',
      };
      return { success: true, data: userAdmin };
    }
    return { success: false, error: res.data?.message || 'Gagal memuat profil.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal mengambil data profil dari server.') };
  }
};

export const updateUserProfile = async (
  payload: Partial<UserAdmin> & { password?: string }
): Promise<{ success: boolean; data?: UserAdmin; error?: string }> => {
  try {
    const res = await axiosInstance.put('/admin/profile', payload);
    if (res.data && res.data.data) {
      const u = res.data.data;
      const userAdmin: UserAdmin = {
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'admin',
        phone: u.phone || '',
        avatar: u.avatar || '',
        bio: u.bio || '',
      };
      return { success: true, data: userAdmin };
    }
    return { success: false, error: res.data?.message || 'Gagal memperbarui profil.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal menyimpan profil ke server.') };
  }
};

// ============================================================
// ADMIN UMKM API — Requires JWT auth
// ============================================================

/**
 * Fetch all UMKM from the ADMIN endpoint (includes all data, requires auth)
 */
export const fetchAdminUmkms = async (): Promise<UMKM[]> => {
  try {
    const res = await axiosInstance.get('/admin/umkm');
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeUmkm);
    }
  } catch (e) {
    console.error('fetchAdminUmkms error:', e);
  }
  return [];
};

export const createUmkm = async (
  data: Partial<UMKM>
): Promise<{ success: boolean; data?: UMKM; error?: string }> => {
  try {
    const res = await axiosInstance.post('/admin/umkm', data);
    if (res.data && res.data.data) {
      return { success: true, data: normalizeUmkm(res.data.data) };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal mendaftarkan UMKM.' };
  } catch (e: any) {
    console.error('createUmkm error:', e);
    return { success: false, error: extractError(e, 'Gagal menghubungkan ke server.') };
  }
};

export const updateUmkm = async (
  id: number | string,
  data: Partial<UMKM>
): Promise<{ success: boolean; data?: UMKM; error?: string }> => {
  try {
    const res = await axiosInstance.put(`/admin/umkm/${id}`, data);
    if (res.data && res.data.data) {
      return { success: true, data: normalizeUmkm(res.data.data) };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal memperbarui UMKM.' };
  } catch (e: any) {
    console.error('updateUmkm error:', e);
    return { success: false, error: extractError(e, 'Gagal menghubungkan ke server.') };
  }
};

export const deleteUmkm = async (
  id: number | string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/admin/umkm/${id}`);
    if (res.data && res.data.success) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menghapus UMKM.' };
  } catch (e: any) {
    console.error('deleteUmkm error:', e);
    return { success: false, error: extractError(e, 'Gagal menghapus data dari server.') };
  }
};

// ============================================================
// ADMIN PRODUCT API — Requires JWT auth
// ============================================================

export const fetchAdminProducts = async (umkmId?: number | string): Promise<UMKMProduct[]> => {
  try {
    const params = umkmId ? { umkmId: String(umkmId) } : {};
    const res = await axiosInstance.get('/admin/products', { params });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map((p: any) => ({
        id: p.id,
        umkmId: p.umkmId,
        name: p.name || '',
        price: Number(p.price) || 0,
        unit: p.unit || 'pcs',
        description: p.description || '',
        image: p.image || '',
        isHalal: Boolean(p.isHalal || p.is_halal),
        halalNumber: p.halalNumber || p.halal_number || '',
      }));
    }
  } catch (e) {
    console.error('fetchAdminProducts error:', e);
  }
  return [];
};

export const createProduct = async (
  productData: Partial<UMKMProduct>
): Promise<{ success: boolean; data?: UMKMProduct; error?: string }> => {
  try {
    const res = await axiosInstance.post('/admin/products', productData);
    if (res.data && res.data.data) {
      const p = res.data.data;
      return {
        success: true,
        data: {
          id: p.id,
          umkmId: p.umkmId,
          name: p.name || '',
          price: Number(p.price) || 0,
          unit: p.unit || 'pcs',
          description: p.description || '',
          image: p.image || '',
          isHalal: Boolean(p.isHalal || p.is_halal),
          halalNumber: p.halalNumber || p.halal_number || '',
        },
      };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menambahkan produk.' };
  } catch (e: any) {
    console.error('createProduct error:', e);
    return { success: false, error: extractError(e, 'Gagal menyimpan produk ke server.') };
  }
};

export const updateProduct = async (
  productId: number | string,
  productData: Partial<UMKMProduct>
): Promise<{ success: boolean; data?: UMKMProduct; error?: string }> => {
  try {
    const res = await axiosInstance.put(`/admin/products/${productId}`, productData);
    if (res.data && res.data.data) {
      const p = res.data.data;
      return {
        success: true,
        data: {
          id: p.id,
          umkmId: p.umkmId,
          name: p.name || '',
          price: Number(p.price) || 0,
          unit: p.unit || 'pcs',
          description: p.description || '',
          image: p.image || '',
          isHalal: Boolean(p.isHalal || p.is_halal),
          halalNumber: p.halalNumber || p.halal_number || '',
        },
      };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal memperbarui produk.' };
  } catch (e: any) {
    console.error('updateProduct error:', e);
    return { success: false, error: extractError(e, 'Gagal memperbarui produk di server.') };
  }
};

export const deleteProduct = async (
  productId: number | string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/admin/products/${productId}`);
    if (res.data && res.data.success) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menghapus produk.' };
  } catch (e: any) {
    console.error('deleteProduct error:', e);
    return { success: false, error: extractError(e, 'Gagal menghapus produk dari server.') };
  }
};

export const fetchAdminFeedbacks = async (): Promise<Feedback[]> => {
  try {
    const res = await axiosInstance.get('/admin/feedbacks');
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map((f: any) => ({
        id: f.id,
        name: f.name || 'Anonim',
        email: f.email || '',
        message: f.message || '',
        createdAt: f.createdAt || f.created_at || new Date().toISOString(),
      }));
    }
  } catch (e: any) {
    console.error('fetchAdminFeedbacks error:', e);
  }
  return [];
};

export const deleteAdminFeedback = async (
  feedbackId: number | string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/admin/feedbacks/${feedbackId}`);
    if (res.data && res.data.success) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menghapus feedback.' };
  } catch (e: any) {
    console.error('deleteAdminFeedback error:', e);
    return { success: false, error: extractError(e, 'Gagal menghapus feedback dari server.') };
  }
};

// ============================================================
// SUPERADMIN API
// ============================================================

export const saveDynamicContent = async (
  content: DynamicContent
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.put('/superadmin/konten', content);
    if (res.data && (res.data.success || res.data.data)) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menyimpan konten.' };
  } catch (e: any) {
    console.error('saveDynamicContent error:', e);
    return { success: false, error: extractError(e, 'Gagal menghubungkan ke server.') };
  }
};

// ============================================================
// UPLOAD API — Requires JWT auth
// ============================================================

/**
 * Upload gambar ke backend (Cloudinary) dan kembalikan URL publik.
 * Uses the backend upload endpoint which requires JWT auth.
 */
export const uploadImage = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Get token from localStorage (set during login)
    const token = typeof window !== 'undefined' ? localStorage.getItem('umkm_token') : null;

    if (!token) {
      return { success: false, error: 'Anda belum login. Silakan login terlebih dahulu.' };
    }

    // Use fetch directly for multipart/form-data (avoid axios content-type issues)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — let browser set it with boundary for multipart
      },
      body: formData,
    });

    // Check if response is JSON
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Upload non-JSON response:', text.slice(0, 500));
      if (res.status === 401 || res.status === 403) {
        return { success: false, error: 'Sesi login Anda telah berakhir. Silakan login ulang.' };
      }
      return { success: false, error: 'Server tidak merespons dengan benar saat upload.' };
    }

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || `Upload gagal (HTTP ${res.status}).` };
    }

    if (data.url || data.imageUrl) {
      return { success: true, url: data.url || data.imageUrl };
    }

    return { success: false, error: data.message || 'Gagal mendapatkan URL gambar dari server.' };
  } catch (e: any) {
    console.error('uploadImage error:', e);
    return { success: false, error: e.message || 'Gagal menghubungkan ke server upload.' };
  }
};
