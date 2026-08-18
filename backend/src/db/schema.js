const { pgTable, serial, text, varchar, integer, real, numeric, jsonb, timestamp } = require('drizzle-orm/pg-core');

// Users Table (SuperAdmin & Admin Staff)
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(), // Hashed with Argon2id
  role: varchar('role', { length: 50 }).notNull().default('admin'), // 'admin' | 'superadmin'
  phone: varchar('phone', { length: 50 }),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// UMKM Table
const umkms = pgTable('umkms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  owner: varchar('owner', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull().default('Kuliner'),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  gmapsUrl: text('gmaps_url'),
  gmapsEmbed: text('gmaps_embed'),
  description: text('description'),
  landingText: text('landing_text'),
  profileImage: text('profile_image'),
  bannerImage: text('banner_image'),
  rating: real('rating').default(5.0),
  reviewCount: integer('review_count').default(0),
  isHalal: integer('is_halal').default(0), // 0: Belum/Tidak, 1: Bersertifikat Halal
  halalNumber: varchar('halal_number', { length: 100 }),
  certifications: jsonb('certifications').default([]), // ['Halal MUI', 'P-IRT', 'BPOM', 'Unggulan Desa']
  latitude: numeric('latitude', { precision: 10, scale: 6 }).default('-6.890000'),
  longitude: numeric('longitude', { precision: 10, scale: 6 }).default('110.145000'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products Table
const products = pgTable('products', {
  id: serial('id').primaryKey(),
  umkmId: integer('umkm_id').references(() => umkms.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: real('price').notNull(),
  unit: varchar('unit', { length: 50 }).default('pcs'),
  description: text('description'),
  image: text('image'),
  isHalal: integer('is_halal').default(0), // 0: Belum/Tidak, 1: Bersertifikat Halal
  halalNumber: varchar('halal_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Feedbacks Table
const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dynamic Content Table (Single row configuration)
const dynamicContent = pgTable('dynamic_content', {
  id: serial('id').primaryKey(),
  siteName: varchar('site_name', { length: 255 }).default('UMKM Korowelang Kulon'),
  headerTitle: text('header_title'),
  headerSubtitle: text('header_subtitle'),
  logoUrl: text('logo_url'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  heroBannerUrl: text('hero_banner_url'),
  aboutTitle: text('about_title'),
  aboutText: text('about_text'),
  villageAddress: text('village_address'),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 100 }),
  footerText: text('footer_text'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews Table (Public User Ratings & Feedback per UMKM)
const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  umkmId: integer('umkm_id').references(() => umkms.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  rating: integer('rating').notNull().default(5), // 1 - 5
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

module.exports = {
  users,
  umkms,
  products,
  feedbacks,
  dynamicContent,
  reviews,
};
