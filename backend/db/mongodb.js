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

  } catch (err) {
    console.warn("⚠️ MongoDB auto-seed notice:", err.message);
  }
}

module.exports = { connectMongoDB };
