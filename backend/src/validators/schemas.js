const { z } = require('zod');

// Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

// Profile Update Schema
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter.' }).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string().min(6, { message: 'Password baru minimal 6 karakter.' }).optional(),
});

// UMKM Schema
const umkmSchema = z.object({
  name: z.string().min(3, { message: 'Nama UMKM minimal 3 karakter.' }),
  owner: z.string().min(2, { message: 'Nama pemilik minimal 2 karakter.' }),
  category: z.string().default('Kuliner'),
  address: z.string().min(5, { message: 'Alamat lengkap minimal 5 karakter.' }),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  gmapsUrl: z.string().optional(),
  gmapsEmbed: z.string().optional(),
  description: z.string().optional(),
  landingText: z.string().optional(),
  profileImage: z.string().optional(),
  bannerImage: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
});

// UMKM Update Schema (All fields optional)
const umkmUpdateSchema = umkmSchema.partial();

// Product Schema
const productSchema = z.object({
  umkmId: z.number({ required_error: 'UMKM ID wajib diisi.' }).int(),
  name: z.string().min(2, { message: 'Nama produk minimal 2 karakter.' }),
  price: z.number({ required_error: 'Harga wajib diisi.' }).positive({ message: 'Harga harus bernilai positif.' }),
  unit: z.string().default('pcs'),
  description: z.string().optional(),
  image: z.string().optional(),
});

// Product Update Schema
const productUpdateSchema = productSchema.partial();

// Feedback Schema
const feedbackSchema = z.object({
  name: z.string().min(2, { message: 'Nama wajib diisi minimal 2 karakter.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  message: z.string().min(5, { message: 'Pesan feedback minimal 5 karakter.' }),
});

// Admin Account Schema (Created by SuperAdmin)
const adminAccountSchema = z.object({
  name: z.string().min(2, { message: 'Nama lengkap wajib diisi.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  role: z.enum(['admin', 'superadmin']).default('admin'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

// Admin Account Update Schema
const adminAccountUpdateSchema = adminAccountSchema.partial();

// Dynamic Content Schema
const dynamicContentSchema = z.object({
  siteName: z.string().optional(),
  headerTitle: z.string().optional(),
  headerSubtitle: z.string().optional(),
  logoUrl: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroBannerUrl: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutText: z.string().optional(),
  villageAddress: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  footerText: z.string().optional(),
});

// Public Review Schema
const reviewSchema = z.object({
  name: z.string().min(2, { message: 'Nama penilai minimal 2 karakter.' }),
  rating: z.number().int().min(1).max(5, { message: 'Rating harus antara 1 sampai 5.' }),
  comment: z.string().min(5, { message: 'Komentar ulasan minimal 5 karakter.' }),
});

module.exports = {
  loginSchema,
  profileSchema,
  umkmSchema,
  umkmUpdateSchema,
  productSchema,
  productUpdateSchema,
  feedbackSchema,
  adminAccountSchema,
  adminAccountUpdateSchema,
  dynamicContentSchema,
  reviewSchema,
};
