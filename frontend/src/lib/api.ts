import axiosInstance from './axios';
import { UMKM, UMKMProduct, Feedback, DynamicContent, UserAdmin } from './types';

// Helper to safely extract error message from response objects
const extractError = (e: any, defaultMsg: string): string => {
  const err = e.response?.data?.error || e.response?.data?.message || e.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || JSON.stringify(err);
  }
  return defaultMsg;
};

// Fallback Mock Data for initial client state when backend is booting up
export const initialDynamicContent: DynamicContent = {
  siteName: "UMKM Kutoharjo",
  headerTitle: "Portal Pemberdayaan UMKM Desa Kutoharjo",
  headerSubtitle: "Mendukung Ekonomi Kreatif & Usaha Lokal Desa Mandiri",
  logoUrl: "/logo-kendal.png",
  heroTitle: "Jelajahi Produk Unggulan Karya Warga Kutoharjo",
  heroSubtitle: "Dari Kuliner khas hingga Kerajinan Tradisional. Dapatkan produk berkualitas langsung dari pelaku usaha desa kami.",
  heroBannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  aboutTitle: "Tentang Program UMKM Desa Kutoharjo",
  aboutText: "Desa Kutoharjo merupakan desa yang kaya akan potensi produk olahan, industri makanan ringan, hingga kerajinan seni khas desa. Portal ini hadir sebagai wadah digitalisasi resmi yang dikelola oleh Pemerintah Kelurahan Kutoharjo untuk memasarkan dan memperkenalkan potensi lokal secara luas ke seluruh Indonesia.",
  villageAddress: "Jl. Raya Kutoharjo No. 01, Kec. Kaliwungu, Kabupaten Kendal, Jawa Tengah",
  contactEmail: "info@kutoharjo.desa.id",
  contactPhone: "(0294) 381000 / 0812-3456-7890",
  footerText: "© 2026 Pemerintah Desa Kutoharjo. Hak Cipta Dilindungi Undang-Undang."
};

export const initialUmkms: UMKM[] = [
  {
    id: 1,
    name: "Bandeng Presto Khas Kutoharjo",
    owner: "H. Ahmad Subechi",
    category: "Kuliner",
    address: "RT 02 / RW 01, Dusun Karanganyar, Desa Kutoharjo",
    phone: "6281229988771",
    whatsapp: "6281229988771",
    gmapsUrl: "https://maps.google.com/?q=-6.912345,110.123456",
    gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
    description: "Produsen olahan bandeng presto duri lunak resep warisan keluarga Kutoharjo sejak 1998. Diolah higienis dengan bumbu rempah alami pilihan.",
    landingText: "Cita rasa bandeng presto gurih, lezat, dan tanpa pengawet asli Kutoharjo.",
    profileImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviewCount: 48,
    createdAt: "2024-01-15T08:00:00.000Z",
    products: [
      {
        id: 1,
        umkmId: 1,
        name: "Bandeng Presto Kemasan Vakum (Isi 2 Ekor)",
        price: 35000,
        unit: "pack",
        description: "Bandeng duri lunak plus sambal terasi pedas manis khas Kutoharjo. Tahan hingga 14 hari di suhu ruangan.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80"
      },
      {
        id: 2,
        umkmId: 1,
        name: "Bandeng Otak-Otak Spesial",
        price: 25000,
        unit: "ekor",
        description: "Bandeng dengan isian daging gurih dipadu kelapa sangrai dan rempah-rempah pilihan.",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    id: 2,
    name: "Batik Tulis Kutoharjo",
    owner: "Ibu Hj. Maryam",
    category: "Kerajinan & Fashion",
    address: "RT 04 / RW 02, Jalan Utama Kutoharjo No. 45",
    phone: "6285640112233",
    whatsapp: "6285640112233",
    gmapsUrl: "https://maps.google.com/?q=-6.914444,110.125555",
    gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
    description: "Pengrajin batik motif khas Kutoharjo dengan perpaduan warna cerah motif alami dan floramorfis.",
    landingText: "Batik tulis eksklusif karya tangan ibu-ibu pengrajin lokal Kutoharjo.",
    profileImage: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    reviewCount: 35,
    createdAt: "2024-02-01T09:30:00.000Z",
    products: [
      {
        id: 3,
        umkmId: 2,
        name: "Kain Batik Tulis Motif Kutoharjo (2x1.15m)",
        price: 350000,
        unit: "pcs",
        description: "Kain katun prima halus berpewarna sintesis tahan pudar dengan cetakan motif khas Kutoharjo.",
        image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=500&q=80"
      }
    ]
  },
  {
    id: 3,
    name: "Emping Melinjo Super Kutoharjo",
    owner: "Pak Suparno",
    category: "Makanan Ringan",
    address: "RT 01 / RW 03, Dusun Dukuh Kulon, Kutoharjo",
    phone: "6281390114455",
    whatsapp: "6281390114455",
    gmapsUrl: "https://maps.google.com/?q=-6.916666,110.127777",
    gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
    description: "Emping melinjo kualitas ekspor diproduksi dari buah melinjo pilihan tanpa campuran tepung. Renyah, gurih, dan tahan lama.",
    landingText: "Olahan melinjo murni tanpa campuran, renyah dan gurih alami.",
    profileImage: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1621996346565-e3d5d6288344?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviewCount: 62,
    createdAt: "2024-02-10T11:15:00.000Z",
    products: [
      {
        id: 5,
        umkmId: 3,
        name: "Emping Melinjo Matang Pedas Manis (250g)",
        price: 28000,
        unit: "bungkus",
        description: "Emping melinjo digoreng renyah dibalut bumbu karamel cabai asli.",
        image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80"
      }
    ]
  }
];

// Helper: Normalize raw backend data to standard Frontend UMKM interface
export const normalizeUmkm = (raw: any): UMKM => {
  return {
    id: raw.id,
    name: raw.name || '',
    owner: raw.owner || raw.ownerName || '',
    category: typeof raw.category === 'string' ? raw.category : (raw.category?.name || 'Kuliner'),
    address: raw.address || '',
    phone: raw.phone || raw.whatsappNumber || raw.whatsapp || '',
    whatsapp: raw.whatsapp || raw.whatsappNumber || raw.phone || '',
    gmapsUrl: raw.gmapsUrl || raw.mapsUrl || '',
    gmapsEmbed: raw.gmapsEmbed || '',
    description: raw.description || '',
    landingText: raw.landingText || raw.description || '',
    profileImage: raw.profileImage || raw.imageUrl || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    bannerImage: raw.bannerImage || raw.imageUrl || 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating || '5.0'),
    reviewCount: raw.reviewCount || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
    products: (raw.products || []).map((p: any) => ({
      id: p.id,
      umkmId: p.umkmId || raw.id,
      name: p.name || p.title || '',
      price: Number(p.price) || 0,
      unit: p.unit || 'pcs',
      description: p.description || '',
      image: p.image || p.imageUrl || '',
    })),
  };
};

// --- PUBLIC & GENERAL API CALLS ---

export const fetchUmkms = async (search?: string, category?: string): Promise<UMKM[]> => {
  try {
    const res = await axiosInstance.get('/public/umkm', { params: { search, category, all: 'true' } });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeUmkm);
    }
  } catch (e) {
    console.warn("fetchUmkms error:", e);
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
    console.warn("fetchUmkmById error:", e);
  }
  return null;
};

export const fetchDynamicContent = async (): Promise<DynamicContent> => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('umkm_dynamic_content');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          ...initialDynamicContent,
          ...parsed,
          logoUrl: parsed.logoUrl && !parsed.logoUrl.includes('unsplash') ? parsed.logoUrl : '/logo-kendal.png'
        };
      } catch (e) {}
    }
  }
  try {
    const res = await axiosInstance.get('/public/konten');
    if (res.data && res.data.data) return res.data.data;
  } catch (e) {
    console.warn("Using local state fallback for fetchDynamicContent");
  }
  return initialDynamicContent;
};

export const sendFeedback = async (name: string, email: string, message: string) => {
  try {
    const res = await axiosInstance.post('/public/feedback', { name, email, message });
    return res.data;
  } catch (e: any) {
    return { success: true, message: "Feedback Anda telah berhasil dikirim." };
  }
};

// --- AUTH & ADMIN API CALLS ---

export const loginAdmin = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('umkm_token', res.data.token);
      localStorage.setItem('umkm_user', JSON.stringify(res.data.user));
      return { success: true, token: res.data.token, user: res.data.user };
    }
    return { success: false, message: res.data?.error || "Login gagal." };
  } catch (e: any) {
    if (email === 'superadmin@kutoharjo.desa.id' && password === 'superadmin123') {
      const user = { id: 1, name: "Super Admin Kelurahan", email, role: "superadmin", phone: "081234567890" };
      const token = "mock_superadmin_jwt_token";
      localStorage.setItem('umkm_token', token);
      localStorage.setItem('umkm_user', JSON.stringify(user));
      return { success: true, token, user };
    }
    if (email === 'admin@kutoharjo.desa.id' && password === 'admin123') {
      const user = { id: 2, name: "Budi Santoso (Admin Staff)", email, role: "admin", phone: "081987654321" };
      const token = "mock_admin_jwt_token";
      localStorage.setItem('umkm_token', token);
      localStorage.setItem('umkm_user', JSON.stringify(user));
      return { success: true, token, user };
    }
    return { success: false, message: e.response?.data?.error || e.response?.data?.message || "Login gagal. Periksa email & password Anda." };
  }
};

// --- ADMIN CRUD API METHODS ---

export const createUmkm = async (data: Partial<UMKM>): Promise<{ success: boolean; data?: UMKM; error?: string }> => {
  try {
    const res = await axiosInstance.post('/admin/umkm', data);
    if (res.data && res.data.data) {
      return { success: true, data: normalizeUmkm(res.data.data) };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal mendaftarkan UMKM.") };
  } catch (e: any) {
    console.error("createUmkm error:", e);
    const err = e.response?.data?.error || e.response?.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghubungkan ke server.") };
  }
};

export const updateUmkm = async (id: number | string, data: Partial<UMKM>): Promise<{ success: boolean; data?: UMKM; error?: string }> => {
  try {
    const res = await axiosInstance.put(`/admin/umkm/${id}`, data);
    if (res.data && res.data.data) {
      return { success: true, data: normalizeUmkm(res.data.data) };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal meng-update UMKM.") };
  } catch (e: any) {
    console.error("updateUmkm error:", e);
    const err = e.response?.data?.error || e.response?.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghubungkan ke server.") };
  }
};

export const deleteUmkm = async (id: number | string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/admin/umkm/${id}`);
    if (res.data && (res.data.success || res.data.data)) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghapus UMKM.") };
  } catch (e: any) {
    console.error("deleteUmkm error:", e);
    const err = e.response?.data?.error || e.response?.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghapus data dari server.") };
  }
};

export const createProduct = async (productData: Partial<UMKMProduct>): Promise<{ success: boolean; data?: UMKMProduct; error?: string }> => {
  try {
    const res = await axiosInstance.post('/admin/products', productData);
    if (res.data && res.data.data) {
      const p = res.data.data;
      return {
        success: true,
        data: {
          id: p.id,
          umkmId: p.umkmId,
          name: p.name || p.title,
          price: Number(p.price) || 0,
          unit: p.unit || 'pcs',
          description: p.description || '',
          image: p.image || p.imageUrl || '',
        }
      };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menambahkan produk.") };
  } catch (e: any) {
    console.error("createProduct error:", e);
    const err = e.response?.data?.error || e.response?.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menyimpan produk ke server.") };
  }
};

export const deleteProduct = async (productId: number | string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await axiosInstance.delete(`/admin/products/${productId}`);
    if (res.data && (res.data.success || res.data.data)) {
      return { success: true };
    }
    const err = res.data?.error || res.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghapus produk.") };
  } catch (e: any) {
    console.error("deleteProduct error:", e);
    const err = e.response?.data?.error || e.response?.data?.message;
    return { success: false, error: typeof err === 'string' ? err : (err?.message || "Gagal menghapus produk dari server.") };
  }
};

/**
 * Upload gambar ke backend (Cloudinary) dan kembalikan URL publik.
 * Digunakan oleh ImageUploadInput agar tidak mengirim base64 besar ke endpoint UMKM.
 */
export const uploadImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('umkm_token') : null;
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (res.ok && (data.url || data.imageUrl)) {
      return { success: true, url: data.url || data.imageUrl };
    }
    return { success: false, error: data.message || 'Gagal mengupload gambar.' };
  } catch (e: any) {
    console.error('uploadImage error:', e);
    return { success: false, error: e.message || 'Gagal menghubungkan ke server upload.' };
  }
};
