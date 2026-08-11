require("dotenv").config();
const { getPool, closePool } = require("./mysql");
const bcrypt = require("bcryptjs");

async function initMySQLDatabase() {
  const pool = getPool();
  if (!pool) {
    console.log("⚠️ MySQL credentials belum dikonfigurasi. Melewati inisialisasi database.");
    process.exit(0);
  }

  console.log("⚙️ Initializing MySQL Database Schema...");

  const conn = await pool.getConnection();

  try {
    // Create tables
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        profile_image TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'users' ready.");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        icon_name VARCHAR(255) NOT NULL,
        UNIQUE KEY idx_categories_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'categories' ready.");

    await conn.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'umkms' ready.");

    await conn.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'products' ready.");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(50) PRIMARY KEY,
        umkm_id VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_reviews_umkm_id (umkm_id),
        CONSTRAINT fk_reviews_umkm FOREIGN KEY (umkm_id) REFERENCES umkms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'reviews' ready.");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(50) PRIMARY KEY,
        \`key\` VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        UNIQUE KEY idx_site_settings_key (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ Table 'site_settings' ready.");

    // ==============================
    // Seed Data
    // ==============================
    console.log("\n🌱 Seeding initial data...");

    // Seed Categories
    const categories = [
      { id: "cat-1", name: "Kuliner", slug: "kuliner", icon_name: "restaurant" },
      { id: "cat-2", name: "Kerajinan", slug: "kerajinan", icon_name: "palette" },
      { id: "cat-3", name: "Jasa", slug: "jasa", icon_name: "handyman" },
      { id: "cat-4", name: "Fashion", slug: "fashion", icon_name: "checkroom" },
      { id: "cat-5", name: "Pertanian & Peternakan", slug: "pertanian-peternakan", icon_name: "agriculture" },
    ];

    for (const c of categories) {
      await conn.execute(
        `INSERT IGNORE INTO categories (id, name, slug, icon_name) VALUES (?, ?, ?, ?)`,
        [c.id, c.name, c.slug, c.icon_name]
      );
    }
    console.log("  ✅ Categories seeded.");

    // Seed Users
    const superAdminPassword = await bcrypt.hash("superadmin123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);

    await conn.execute(
      `INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ["usr-superadmin-kutoharjo", "Super Admin Desa Kutoharjo", "superadmin@kutoharjo.desa.id", superAdminPassword, "SUPERADMIN"]
    );
    await conn.execute(
      `INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ["usr-admin-kutoharjo", "Admin Kutoharjo", "admin@kutoharjo.desa.id", adminPassword, "ADMIN"]
    );
    console.log("  ✅ Users seeded.");

    // Seed Site Settings
    const settings = [
      { id: "st-1", key: "site_name", value: "Kutoharjo UMKM Hub" },
      { id: "st-2", key: "hero_title", value: "Temukan & Dukung UMKM Lokal Desa Kutoharjo" },
      { id: "st-3", key: "hero_subtitle", value: "Direktori digital yang menghubungkan Anda langsung dengan pelaku usaha mikro, kecil, dan menengah di Desa Kutoharjo. Beli lokal, tumbuh bersama." },
    ];

    for (const s of settings) {
      await conn.execute(
        `INSERT IGNORE INTO site_settings (id, \`key\`, value) VALUES (?, ?, ?)`,
        [s.id, s.key, s.value]
      );
    }
    console.log("  ✅ Site settings seeded.");

    // Seed UMKMs
    const umkms = [
      {
        id: "umkm-1", user_id: "usr-admin-kutoharjo", category_id: "cat-1",
        name: "Bandeng Presto & Cabut Duri Mbak Sum", slug: "bandeng-presto-mbak-sum",
        owner_name: "Mbak Sumiati",
        description: "Produk unggulan olahan ikan bandeng presto dan cabut duri resep tradisional khas Kaliwungu, Desa Kutoharjo.",
        address: "Jl. Raya Kutoharjo No. 42, RT 02 / RW 03", dusun: "Kutoharjo",
        operational_hours: "08:00 - 20:00 WIB", whatsapp_number: "6281234567891",
        maps_url: "https://maps.google.com/?q=-6.9535,110.2642",
        instagram_url: "https://instagram.com/bandeng_mbaksum",
        image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        certifications: '["Halal MUI","P-IRT","Unggulan Desa"]', rating: 4.90, review_count: 12,
      },
      {
        id: "umkm-2", user_id: "usr-admin-kutoharjo", category_id: "cat-1",
        name: "Kerupuk Rambak Sapi Berkah Barokah", slug: "rambak-sapi-berkah-barokah",
        owner_name: "H. Ahmad Rofiq",
        description: "Produsen kerupuk rambak kulit sapi asli khas Kutoharjo Kaliwungu.",
        address: "Dukuh Gambiran RT 04 / RW 01, Desa Kutoharjo", dusun: "Gambiran",
        operational_hours: "07:00 - 17:00 WIB", whatsapp_number: "6285712345678",
        maps_url: "https://maps.google.com/?q=-6.9540,110.2650",
        instagram_url: "https://instagram.com/rambak_berkah_kutoharjo",
        image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        certifications: '["Halal MUI","P-IRT"]', rating: 4.80, review_count: 15,
      },
      {
        id: "umkm-3", user_id: "usr-admin-kutoharjo", category_id: "cat-1",
        name: "Warung Soto & Garang Asem Pak Mul", slug: "warung-soto-garang-asem-pak-mul",
        owner_name: "Pak Mulyono",
        description: "Kuliner olahan ayam kampung legendaris Desa Kutoharjo.",
        address: "Jl. Pangeran Jumeneng No. 15, Dukuh Krajan", dusun: "Krajan",
        operational_hours: "06:30 - 16:00 WIB", whatsapp_number: "6281398765432",
        maps_url: "https://maps.google.com/?q=-6.9528,110.2635",
        instagram_url: "https://instagram.com/soto_pakmul_kutoharjo",
        image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        certifications: '["Halal MUI","Kuliner Khas Desa"]', rating: 4.85, review_count: 20,
      },
    ];

    for (const u of umkms) {
      await conn.execute(
        `INSERT IGNORE INTO umkms (id, user_id, category_id, name, slug, owner_name, description, address, dusun, operational_hours, whatsapp_number, maps_url, instagram_url, image_url, is_verified, certifications, rating, review_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [u.id, u.user_id, u.category_id, u.name, u.slug, u.owner_name, u.description, u.address, u.dusun, u.operational_hours, u.whatsapp_number, u.maps_url, u.instagram_url, u.image_url, u.certifications, u.rating, u.review_count]
      );
    }
    console.log("  ✅ UMKMs seeded.");

    // Seed Products
    const products = [
      { id: "prod-101", umkm_id: "umkm-1", title: "Bandeng Presto Vacuum (500gr)", price: 45000, description: "Ikan bandeng presto duri lunak dengan bumbu rempah pilihan.", image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80" },
      { id: "prod-102", umkm_id: "umkm-1", title: "Bandeng Cabut Duri Crispy", price: 40000, description: "Daging bandeng murni bebas duri dengan balutan tepung bumbu krispi.", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
      { id: "prod-201", umkm_id: "umkm-2", title: "Kerupuk Rambak Sapi 250gr", price: 25000, description: "Rambak kulit sapi goreng renyah dan gurih.", image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80" },
      { id: "prod-301", umkm_id: "umkm-3", title: "Soto Ayam Kampung Spesial", price: 15000, description: "Soto ayam kampung dengan kuah bening rempah.", image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" },
    ];

    for (const p of products) {
      await conn.execute(
        `INSERT IGNORE INTO products (id, umkm_id, title, price, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [p.id, p.umkm_id, p.title, p.price, p.description, p.image_url]
      );
    }
    console.log("  ✅ Products seeded.");

    // Seed Reviews
    const reviews = [
      { id: "rev-001", umkm_id: "umkm-1", name: "Budi Santoso", rating: 5, comment: "Bandeng presto Mbak Sum benar-benar gurih dan tidak berbau tanah!" },
      { id: "rev-002", umkm_id: "umkm-2", name: "Siti Rahmawati", rating: 5, comment: "Kerupuk rambak sapinya sangat renyah dan gurih alami." },
    ];

    for (const r of reviews) {
      await conn.execute(
        `INSERT IGNORE INTO reviews (id, umkm_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)`,
        [r.id, r.umkm_id, r.name, r.rating, r.comment]
      );
    }
    console.log("  ✅ Reviews seeded.");

    console.log("\n✅ MySQL Database initialized & seeded successfully!");
  } catch (err) {
    console.error("❌ Error initializing MySQL database:", err);
    throw err;
  } finally {
    conn.release();
    await closePool();
  }
}

initMySQLDatabase().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
