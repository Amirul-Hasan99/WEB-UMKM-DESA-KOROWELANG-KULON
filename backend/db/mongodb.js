const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Global cache for Mongoose connection across Vercel Serverless Function invocations
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Atlas
 */
async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("your_mongodb_atlas_connection_string")) {
    throw new Error(
      "❌ MONGODB_URI belum dikonfigurasi! Harap atur connection string MongoDB Atlas Anda pada environment variables (MONGODB_URI)."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then(async (m) => {
        console.log("🍃 MongoDB Atlas terhubung secara penuh!");
        await seedInitialDataIfNeeded(m);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("❌ Gagal terhubung ke MongoDB Atlas:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Seed initial data if MongoDB collections are empty
 */
async function seedInitialDataIfNeeded() {
  try {
    const { User, Category, UMKM, Product, SiteSetting } = require("./models");

    // 1. Seed Categories if empty
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log("🌱 Seeding initial categories into MongoDB Atlas...");
      await Category.insertMany([
        { id: "cat-1", name: "Kuliner", slug: "kuliner", icon_name: "restaurant" },
        { id: "cat-2", name: "Kerajinan", slug: "kerajinan", icon_name: "palette" },
        { id: "cat-3", name: "Jasa", slug: "jasa", icon_name: "handyman" },
        { id: "cat-4", name: "Fashion", slug: "fashion", icon_name: "checkroom" },
        { id: "cat-5", name: "Pertanian & Peternakan", slug: "pertanian-peternakan", icon_name: "agriculture" },
      ]);
    }

    // 2. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding initial admin users into MongoDB Atlas...");
      const superAdminPassword = await bcrypt.hash("superadmin123", 10);
      const adminPassword = await bcrypt.hash("admin123", 10);

      await User.insertMany([
        {
          id: "usr-superadmin-kutoharjo",
          name: "Super Admin Desa Kutoharjo",
          email: "superadmin@kutoharjo.desa.id",
          password_hash: superAdminPassword,
          role: "SUPERADMIN",
          created_at: new Date(),
        },
        {
          id: "usr-admin-kutoharjo",
          name: "Admin Kutoharjo",
          email: "admin@kutoharjo.desa.id",
          password_hash: adminPassword,
          role: "ADMIN",
          created_at: new Date(),
        },
      ]);
    }

    // 3. Seed Site Settings if empty
    const settingCount = await SiteSetting.countDocuments();
    if (settingCount === 0) {
      console.log("🌱 Seeding initial site settings into MongoDB Atlas...");
      await SiteSetting.insertMany([
        { id: "st-1", key: "site_name", value: "Kutoharjo UMKM Hub" },
        { id: "st-2", key: "hero_title", value: "Temukan & Dukung UMKM Lokal Desa Kutoharjo" },
        { id: "st-3", key: "hero_subtitle", value: "Direktori digital yang menghubungkan Anda langsung dengan pelaku usaha mikro, kecil, dan menengah di Desa Kutoharjo. Beli lokal, tumbuh bersama." },
      ]);
    }

    // 4. Seed UMKMs & Products if empty
    const umkmCount = await UMKM.countDocuments();
    if (umkmCount === 0) {
      console.log("🌱 Seeding initial UMKMs into MongoDB Atlas...");
      await UMKM.insertMany([
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
          is_verified: true, certifications: ["Halal MUI", "P-IRT", "Unggulan Desa"],
          rating: 4.90, review_count: 12,
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
          is_verified: true, certifications: ["Halal MUI", "P-IRT"],
          rating: 4.80, review_count: 15,
        },
      ]);

      await Product.insertMany([
        { id: "prod-101", umkm_id: "umkm-1", title: "Bandeng Presto Vacuum (500gr)", price: 45000, description: "Ikan bandeng presto duri lunak dengan bumbu rempah pilihan.", image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80" },
        { id: "prod-201", umkm_id: "umkm-2", title: "Kerupuk Rambak Sapi 250gr", price: 25000, description: "Rambak kulit sapi goreng renyah dan gurih.", image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80" },
      ]);
    }
  } catch (err) {
    console.warn("⚠️ MongoDB auto-seed notice:", err.message);
  }
}

module.exports = { connectMongoDB };
