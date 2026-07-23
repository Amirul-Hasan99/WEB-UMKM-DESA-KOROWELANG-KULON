export interface UMKMProduct {
  id: number;
  umkmId: number;
  name: string;
  price: number;
  unit: string;
  description: string;
  image: string;
}

export interface UMKM {
  id: number;
  name: string;
  owner: string;
  category: string;
  address: string;
  phone: string;
  whatsapp: string;
  gmapsUrl: string;
  gmapsEmbed: string;
  description: string;
  landingText: string;
  profileImage: string;
  bannerImage: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  products?: UMKMProduct[];
}

export interface Feedback {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface DynamicContent {
  siteName: string;
  headerTitle: string;
  headerSubtitle: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  aboutTitle: string;
  aboutText: string;
  villageAddress: string;
  contactEmail: string;
  contactPhone: string;
  footerText: string;
}

export interface UserAdmin {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  phone?: string;
  avatar?: string;
  bio?: string;
}
