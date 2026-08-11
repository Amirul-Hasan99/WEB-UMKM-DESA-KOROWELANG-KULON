import bcrypt from "bcryptjs";

export interface CategoryStore {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  _count?: { umkms: number };
}

export interface ProductStore {
  id: string;
  umkmId: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface ReviewStore {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UmkmStore {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  slug: string;
  ownerName: string;
  description: string;
  address: string;
  dusun: string;
  operationalHours?: string | null;
  whatsappNumber: string;
  mapsUrl?: string | null;
  instagramUrl?: string | null;
  imageUrl: string;
  isVerified: boolean;
  certifications?: string[];
  latitude?: number | null;
  longitude?: number | null;
  rating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: CategoryStore | null;
  products?: ProductStore[];
  reviews?: ReviewStore[];
}

export interface UserStore {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPERADMIN" | "ADMIN";
  createdAt: string;
}

const superAdminHash = bcrypt.hashSync("superadmin123", 10);
const adminHash = bcrypt.hashSync("admin123", 10);

export const usersStore: UserStore[] = [
  {
    id: "usr-superadmin-kutoharjo",
    name: "Super Admin Desa Kutoharjo",
    email: "superadmin@kutoharjo.desa.id",
    passwordHash: superAdminHash,
    role: "SUPERADMIN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-admin-kutoharjo",
    name: "Admin Kutoharjo",
    email: "admin@kutoharjo.desa.id",
    passwordHash: adminHash,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  },
];

export const categoriesStore: CategoryStore[] = [
  { id: "cat-1", name: "Kuliner", slug: "kuliner", iconName: "Utensils", _count: { umkms: 3 } },
  { id: "cat-2", name: "Kerajinan", slug: "kerajinan", iconName: "Palette", _count: { umkms: 1 } },
  { id: "cat-3", name: "Jasa", slug: "jasa", iconName: "Wrench", _count: { umkms: 1 } },
  { id: "cat-4", name: "Fashion", slug: "fashion", iconName: "Shirt", _count: { umkms: 0 } },
  { id: "cat-5", name: "Pertanian & Peternakan", slug: "pertanian-peternakan", iconName: "Wheat", _count: { umkms: 0 } },
];

export const siteSettingsStore: Record<string, string> = {
  site_name: "Kutoharjo UMKM Hub",
  hero_title: "Temukan & Dukung UMKM Lokal Desa Kutoharjo",
  hero_subtitle: "Direktori digital yang menghubungkan Anda langsung dengan pelaku usaha mikro, kecil, dan menengah di Desa Kutoharjo. Beli lokal, tumbuh bersama.",
};

export const umkmsStore: UmkmStore[] = [
  {
    id: "umkm-1",
    userId: "usr-admin-kutoharjo",
    categoryId: "cat-1",
    name: "Bandeng Presto & Cabut Duri Mbak Sum",
    slug: "bandeng-presto-mbak-sum",
    ownerName: "Mbak Sumiati",
    description: "Produk unggulan olahan ikan bandeng presto dan cabut duri resep tradisional khas Kaliwungu, Desa Kutoharjo.",
    address: "Jl. Raya Kutoharjo No. 42, RT 02 / RW 03",
    dusun: "Kutoharjo",
    operationalHours: "08:00 - 20:00 WIB",
    whatsappNumber: "6281234567891",
    mapsUrl: "https://maps.google.com/?q=-6.9535,110.2642",
    instagramUrl: "https://instagram.com/bandeng_mbaksum",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    isVerified: true,
    certifications: ["Halal MUI", "P-IRT", "Unggulan Desa"],
    rating: "4.90",
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: categoriesStore[0],
    products: [
      {
        id: "prod-101",
        umkmId: "umkm-1",
        title: "Bandeng Presto Vacuum (500gr)",
        price: 45000,
        description: "Ikan bandeng presto duri lunak dengan bumbu rempah pilihan.",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        createdAt: new Date().toISOString(),
      },
    ],
    reviews: [
      {
        id: "rev-001",
        name: "Budi Santoso",
        rating: 5,
        comment: "Bandeng presto Mbak Sum benar-benar gurih dan tidak berbau tanah!",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "umkm-2",
    userId: "usr-admin-kutoharjo",
    categoryId: "cat-1",
    name: "Kerupuk Rambak Sapi Berkah Barokah",
    slug: "rambak-sapi-berkah-barokah",
    ownerName: "H. Ahmad Rofiq",
    description: "Produsen kerupuk rambak kulit sapi asli khas Kutoharjo Kaliwungu.",
    address: "Dukuh Gambiran RT 04 / RW 01, Desa Kutoharjo",
    dusun: "Gambiran",
    operationalHours: "07:00 - 17:00 WIB",
    whatsappNumber: "6285712345678",
    mapsUrl: "https://maps.google.com/?q=-6.9540,110.2650",
    instagramUrl: "https://instagram.com/rambak_berkah_kutoharjo",
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
    isVerified: true,
    certifications: ["Halal MUI", "P-IRT"],
    rating: "4.80",
    reviewCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: categoriesStore[0],
    products: [
      {
        id: "prod-201",
        umkmId: "umkm-2",
        title: "Kerupuk Rambak Sapi 250gr",
        price: 25000,
        description: "Rambak kulit sapi goreng renyah dan gurih.",
        imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        createdAt: new Date().toISOString(),
      },
    ],
    reviews: [],
  },
];

export function findUserByEmailStore(email: string): UserStore | undefined {
  return usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getCategoriesStore(): CategoryStore[] {
  return categoriesStore;
}

export function getSiteSettingsStore(): Record<string, string> {
  return siteSettingsStore;
}

export function getUmkmsStore(query: any = {}): UmkmStore[] {
  let list = umkmsStore.filter((u) => u.isVerified);
  if (query.category) {
    list = list.filter((u) => u.category?.slug === query.category);
  }
  if (query.dusun) {
    list = list.filter((u) => u.dusun === query.dusun);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(s) || u.description.toLowerCase().includes(s));
  }
  return list;
}

export function getUmkmBySlugStore(slug: string): UmkmStore | undefined {
  return umkmsStore.find((u) => u.slug === slug || u.id === slug);
}
