-- MySQL Schema for UMKM Desa Kutoharjo
-- Compatible with Railway MySQL & phpMyAdmin

CREATE DATABASE IF NOT EXISTS umkm_kutoharjo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE umkm_kutoharjo;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon_name VARCHAR(255) NOT NULL,
  UNIQUE KEY idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: umkms
-- ============================================
CREATE TABLE IF NOT EXISTS umkms (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  category_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  dusun VARCHAR(255) NOT NULL,
  operational_hours TEXT,
  whatsapp_number VARCHAR(50) NOT NULL,
  maps_url TEXT,
  instagram_url TEXT,
  image_url TEXT NOT NULL,
  is_verified TINYINT(1) DEFAULT 1,
  certifications JSON,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_umkms_slug (slug),
  KEY idx_umkms_category_id (category_id),
  KEY idx_umkms_dusun (dusun),
  KEY idx_umkms_user_id (user_id),
  CONSTRAINT fk_umkms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_umkms_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  umkm_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_products_umkm_id (umkm_id),
  CONSTRAINT fk_products_umkm FOREIGN KEY (umkm_id) REFERENCES umkms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: reviews
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(50) PRIMARY KEY,
  umkm_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reviews_umkm_id (umkm_id),
  CONSTRAINT fk_reviews_umkm FOREIGN KEY (umkm_id) REFERENCES umkms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: site_settings
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(50) PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  UNIQUE KEY idx_site_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
