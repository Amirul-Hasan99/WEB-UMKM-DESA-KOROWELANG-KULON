const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_FILE = path.join(__dirname, "data.json");

function getInitialData() {
  const superAdminPassword = bcrypt.hashSync("superadmin123", 10);
  const adminPassword = bcrypt.hashSync("admin123", 10);

  return {
    users: [
      {
        id: "usr-superadmin-kutoharjo",
        name: "Super Admin Desa Kutoharjo",
        email: "superadmin@kutoharjo.desa.id",
        password_hash: superAdminPassword,
        role: "SUPERADMIN",
        created_at: new Date().toISOString(),
      },
      {
        id: "usr-admin-kutoharjo",
        name: "Admin Kutoharjo",
        email: "admin@kutoharjo.desa.id",
        password_hash: adminPassword,
        role: "ADMIN",
        created_at: new Date().toISOString(),
      },
    ],
    categories: [
      { id: "cat-1", name: "Kuliner", slug: "kuliner", icon_name: "restaurant" },
      { id: "cat-2", name: "Kerajinan", slug: "kerajinan", icon_name: "palette" },
      { id: "cat-3", name: "Jasa", slug: "jasa", icon_name: "handyman" },
      { id: "cat-4", name: "Fashion", slug: "fashion", icon_name: "checkroom" },
      { id: "cat-5", name: "Pertanian & Peternakan", slug: "pertanian-peternakan", icon_name: "agriculture" },
    ],
    site_settings: [
      { id: "st-1", key: "site_name", value: "Kutoharjo UMKM Hub" },
      { id: "st-2", key: "hero_title", value: "Temukan & Dukung UMKM Lokal Desa Kutoharjo" },
      { id: "st-3", key: "hero_subtitle", value: "Direktori digital yang menghubungkan Anda langsung dengan pelaku usaha mikro, kecil, dan menengah di Desa Kutoharjo. Beli lokal, tumbuh bersama." },
    ],
    umkms: [
      {
        id: "umkm-1",
        user_id: "usr-admin-kutoharjo",
        category_id: "cat-1",
        name: "Bandeng Presto & Cabut Duri Mbak Sum",
        slug: "bandeng-presto-mbak-sum",
        owner_name: "Mbak Sumiati",
        description: "Produk unggulan olahan ikan bandeng presto dan cabut duri resep tradisional khas Kaliwungu, Desa Kutoharjo.",
        address: "Jl. Raya Kutoharjo No. 42, RT 02 / RW 03",
        dusun: "Kutoharjo",
        operational_hours: "08:00 - 20:00 WIB",
        whatsapp_number: "6281234567891",
        maps_url: "https://maps.google.com/?q=-6.9535,110.2642",
        instagram_url: "https://instagram.com/bandeng_mbaksum",
        image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        is_verified: true,
        certifications: ["Halal MUI", "P-IRT", "Unggulan Desa"],
        rating: 4.90,
        review_count: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "umkm-2",
        user_id: "usr-admin-kutoharjo",
        category_id: "cat-1",
        name: "Kerupuk Rambak Sapi Berkah Barokah",
        slug: "rambak-sapi-berkah-barokah",
        owner_name: "H. Ahmad Rofiq",
        description: "Produsen kerupuk rambak kulit sapi asli khas Kutoharjo Kaliwungu.",
        address: "Dukuh Gambiran RT 04 / RW 01, Desa Kutoharjo",
        dusun: "Gambiran",
        operational_hours: "07:00 - 17:00 WIB",
        whatsapp_number: "6285712345678",
        maps_url: "https://maps.google.com/?q=-6.9540,110.2650",
        instagram_url: "https://instagram.com/rambak_berkah_kutoharjo",
        image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        is_verified: true,
        certifications: ["Halal MUI", "P-IRT"],
        rating: 4.80,
        review_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    products: [
      {
        id: "prod-101",
        umkm_id: "umkm-1",
        title: "Bandeng Presto Vacuum (500gr)",
        price: 45000,
        description: "Ikan bandeng presto duri lunak dengan bumbu rempah pilihan.",
        image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      },
      {
        id: "prod-201",
        umkm_id: "umkm-2",
        title: "Kerupuk Rambak Sapi 250gr",
        price: 25000,
        description: "Rambak kulit sapi goreng renyah dan gurih.",
        image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      },
    ],
    reviews: [
      {
        id: "rev-001",
        umkm_id: "umkm-1",
        name: "Budi Santoso",
        rating: 5,
        comment: "Bandeng presto Mbak Sum benar-benar gurih dan tidak berbau tanah!",
        created_at: new Date().toISOString(),
      },
    ],
    feedbacks: [],
  };
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = getInitialData();
    saveData(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.reviews) parsed.reviews = [];
    if (!parsed.feedbacks) parsed.feedbacks = [];
    return parsed;
  } catch (err) {
    console.error("Error loading local data file, re-initializing...", err);
    const initial = getInitialData();
    saveData(initial);
    return initial;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local data file:", err);
  }
}

module.exports = { loadData, saveData, getInitialData };
