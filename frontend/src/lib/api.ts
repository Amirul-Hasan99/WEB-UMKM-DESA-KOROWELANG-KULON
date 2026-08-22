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
    if (res.data && res.data.data) {
      const data = res.data.data;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('umkm_dynamic_content_cache', JSON.stringify(data));
        } catch {}
      }
      return data;
    }
  } catch (e) {
    console.warn('fetchDynamicContent error:', e);
  }

  // Fallback to cache if available
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('umkm_dynamic_content_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return initialDynamicContent;
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
        message: 'Tidak dapat terhubung ke server backend. Pastikan URL backend Vercel sudah benar dan online.',
      };
    }
    if (e.response) {
      if (e.response.status === 401) {
        return {
          success: false,
          message: e.response.data?.message || 'Email atau password salah.',
        };
      }
      if (e.response.status === 404) {
        return {
          success: false,
          message: 'Endpoint backend tidak ditemukan (404). Cek URL NEXT_PUBLIC_BACKEND_URL di Vercel.',
        };
      }
      if (e.response.status >= 500) {
        return {
          success: false,
          message: e.response.data?.message || 'Server backend mengalami error (500). Cek log backend di Vercel.',
        };
      }
      const errMsg = e.response.data?.message || e.response.data?.error;
      if (errMsg) {
        return { success: false, message: String(errMsg) };
      }
    }
    return {
      success: false,
      message: e.message || 'Login gagal. Periksa email & password.',
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
): Promise<{ success: boolean; error?: string; skippedItems?: number }> => {
  try {
    // 1. Sanitize heroMedia: upload data: URLs to server (Cloudinary) so they are publicly accessible
    // IndexedDB is local-only — never store indexeddb:// URLs to database as other users can't access them
    let skippedItems = 0;
    const sanitizedHeroMedia = await Promise.all(
      (content.heroMedia || []).map(async (item) => {
        // Skip items already stored with indexeddb:// URLs — they are local-only and cannot be shared
        if (item.url && item.url.startsWith('indexeddb://')) {
          skippedItems++;
          return null;
        }

        // If it's a data: URL, try to upload to Cloudinary via server API
        if (item.url && item.url.startsWith('data:')) {
          try {
            // Convert data URL to Blob for upload
            const dataUrlParts = item.url.split(',');
            const mimeMatch = dataUrlParts[0].match(/:([^;]+)/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const binaryStr = atob(dataUrlParts[1] || '');
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mime });
            const ext = mime.split('/')[1] || 'jpg';
            const file = new File([blob], `hero-media-${item.id || Date.now()}.${ext}`, { type: mime });

            const formData = new FormData();
            formData.append('media', file);

            const uploadRes = await axiosInstance.post('/admin/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (uploadRes.data) {
              const uploadedUrl = uploadRes.data.url || uploadRes.data.imageUrl || uploadRes.data.mediaUrl;
              if (uploadedUrl && (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://'))) {
                return { ...item, url: uploadedUrl };
              }
            }

            // If upload fails and data URL is small enough (< 200KB), keep it
            if (item.url.length < 200000) {
              return item;
            }

            // Data URL too large and upload failed — skip this item
            console.warn(`Skipping large media item (${item.id}): upload to server failed and data URL too large`);
            skippedItems++;
            return null;
          } catch (uploadErr) {
            console.warn('Failed to upload data: URL to server:', uploadErr);
            if (item.url.length < 200000) return item;
            skippedItems++;
            return null;
          }
        }

        return item;
      })
    );

    // Filter out null (skipped) items and re-index order
    const finalHeroMedia = sanitizedHeroMedia
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item, idx) => ({ ...item, order: idx + 1 }));

    // Sanitize heroBannerUrl if it's a data URL
    let sanitizedBannerUrl = content.heroBannerUrl;
    if (sanitizedBannerUrl && (sanitizedBannerUrl.startsWith('data:') || sanitizedBannerUrl.startsWith('indexeddb://'))) {
      // Use first image from finalHeroMedia as fallback
      const firstImage = finalHeroMedia.find((m) => m.type === 'image');
      sanitizedBannerUrl = firstImage?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    }

    const payload: DynamicContent = {
      ...content,
      heroBannerUrl: sanitizedBannerUrl,
      heroMedia: finalHeroMedia,
    };

    // 2. Cache to local storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('umkm_dynamic_content_cache', JSON.stringify(payload));
      } catch {}
    }

    const res = await axiosInstance.put('/superadmin/konten', payload);
    if (res.data && (res.data.success || res.data.data)) {
      // Clear cache so landing page fetches fresh data from server
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('umkm_dynamic_content_cache');
        } catch {}
      }
      return { success: true, skippedItems };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menyimpan konten.' };
  } catch (e: any) {
    console.error('saveDynamicContent error:', e);
    return { success: false, error: extractError(e, 'Gagal menghubungkan ke server.') };
  }
};

// ============================================================
// SUPERADMIN: ADMIN ACCOUNTS MANAGEMENT API
// ============================================================

export const fetchAdminAccounts = async (): Promise<{ success: boolean; data?: UserAdmin[]; error?: string }> => {
  try {
    const res = await axiosInstance.get('/superadmin/admins');
    if (res.data && Array.isArray(res.data.data)) {
      return { success: true, data: res.data.data as UserAdmin[] };
    }
    return { success: false, error: res.data?.message || 'Gagal memuat daftar akun.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal menghubungkan ke server.') };
  }
};

export const createAdminAccount = async (
  data: { name: string; email: string; password: string; role: 'admin' | 'superadmin'; phone?: string; bio?: string }
): Promise<{ success: boolean; data?: UserAdmin; error?: string }> => {
  try {
    const res = await axiosInstance.post('/superadmin/admins', data);
    if (res.data && res.data.data) {
      return { success: true, data: res.data.data as UserAdmin };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal membuat akun admin.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal menyimpan akun ke server.') };
  }
};

export const updateAdminAccount = async (
  id: number,
  data: { name?: string; email?: string; password?: string; role?: 'admin' | 'superadmin'; phone?: string; bio?: string }
): Promise<{ success: boolean; data?: UserAdmin; error?: string }> => {
  try {
    const res = await axiosInstance.put(`/superadmin/admins/${id}`, data);
    if (res.data && res.data.data) {
      return { success: true, data: res.data.data as UserAdmin };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal memperbarui akun admin.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal memperbarui akun di server.') };
  }
};

export const deleteAdminAccount = async (
  id: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/superadmin/admins/${id}`);
    if (res.data && res.data.success) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : 'Gagal menghapus akun admin.' };
  } catch (e: any) {
    return { success: false, error: extractError(e, 'Gagal menghapus akun dari server.') };
  }
};

// ============================================================
// UPLOAD API — Resilient Hybrid Upload (Supports Image & Video)
// ============================================================

/**
 * Helper to read file as Data URL locally in browser
 */
export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload gambar atau video ke backend dan kembalikan URL publik & tipe media.
 * Dilengkapi automatic local DataURL fallback jika server offline / network failure.
 */
export const uploadMedia = async (
  file: File
): Promise<{ success: boolean; url?: string; mediaType?: 'image' | 'video'; error?: string }> => {
  const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|ogg|mkv)$/i) !== null;
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  try {
    const formData = new FormData();
    formData.append('media', file);

    const res = await axiosInstance.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data) {
      const mediaUrl = res.data.url || res.data.imageUrl || res.data.mediaUrl;
      if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
        return {
          success: true,
          url: mediaUrl,
          mediaType: res.data.mediaType || mediaType,
        };
      }
    }

    // Fallback: Read file directly using browser FileReader if no server URL returned
    const localDataUrl = await readFileAsDataUrl(file);
    return {
      success: true,
      url: localDataUrl,
      mediaType,
    };
  } catch (e: any) {
    console.warn('axios uploadMedia error, attempting local DataURL fallback:', e?.message);
    try {
      const fallbackUrl = await readFileAsDataUrl(file);
      return {
        success: true,
        url: fallbackUrl,
        mediaType,
      };
    } catch {
      return { success: false, error: e?.message || 'Gagal memproses file media.' };
    }
  }
};

/**
 * Upload gambar ke backend (Cloudinary) dan kembalikan URL publik.
 */
export const uploadImage = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  return uploadMedia(file);
};

// ============================================================
// INITIAL FALLBACK DATA
// ============================================================

export const initialDynamicContent: DynamicContent = {
  siteName: 'UMKM Korowelang Kulon',
  headerTitle: 'Portal Resmi UMKM Korowelang Kulon',
  headerSubtitle: 'Kecamatan Cepiring, Kabupaten Kendal, Jawa Tengah',
  logoUrl: '/logo-kendal.png',
  heroTitle: 'Jelajahi Produk Unggulan Karya Warga Korowelang Kulon',
  heroSubtitle: 'Dari Kuliner hingga Olahan Khas Desa. Dapatkan produk berkualitas langsung dari UMKM desa kami.',
  heroBannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  heroMedia: [
    {
      id: 'default-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      title: 'Produk Olahan & Kerajinan Tangan',
      subtitle: 'Mendorong kemandirian ekonomi masyarakat Korowelang Kulon.',
      order: 1,
    },
    {
      id: 'default-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      title: 'Kuliner & Jajanan Tradisional',
      subtitle: 'Cita rasa khas nusantara buatan tangan warga desa.',
      order: 2,
    },
  ],
  aboutTitle: 'Tentang Program UMKM Desa Korowelang Kulon',
  aboutText: 'Desa Korowelang Kulon merupakan desa yang kaya akan potensi produk olahan, industri makanan ringan, hasil tambak & pertanian, hingga kerajinan seni khas desa. Portal ini hadir sebagai wadah digitalisasi resmi yang dikelola oleh Pemerintah Desa Korowelang Kulon untuk memasarkan dan memperkenalkan potensi lokal secara luas ke seluruh Indonesia.',
  villageAddress: 'Jl. Raya Korowelang Kulon, Kec. Cepiring, Kab. Kendal',
  contactEmail: 'info@korowelangkulon.desa.id',
  contactPhone: '+62 812-3456-7890',
  footerText: '© 2026 Pemerintah Desa Korowelang Kulon.',
};

export const initialUmkms: UMKM[] = [
  {
    id: 1,
    name: 'Bandeng Presto Bu Siti',
    owner: 'Siti Rahmawati',
    category: 'Kuliner',
    address: 'RT 02 / RW 01, Dusun Krajan, Korowelang Kulon',
    phone: '081234567890',
    whatsapp: '6281234567890',
    gmapsUrl: 'https://maps.google.com/?q=Korowelang+Kulon',
    gmapsEmbed: '',
    description: 'Olahan bandeng presto khas pesisir dengan duri lunak dan rempah istimewa.',
    landingText: 'Bandeng presto duri lunak dengan bumbu rempah pilihan khas pesisir Korowelang.',
    profileImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 28,
    isHalal: true,
    halalNumber: 'ID33110001234560723',
    certifications: ['Halal MUI', 'P-IRT'],
    createdAt: '2026-01-15T08:00:00.000Z',
    products: [
      {
        id: 101,
        umkmId: 1,
        name: 'Bandeng Presto Vacuum Pack 500gr',
        price: 35000,
        unit: 'pack',
        description: 'Bandeng presto isi 2 ekor dikemas vacuum steril.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
        isHalal: true,
      },
    ],
  },
];
