// Stateful Mock Database for UMKM Desa Korowelang Kulon

const mockData = {
  users: [
    {
      id: 1,
      name: "Super Admin Kelurahan",
      email: "superadmin@korowelangkulon.desa.id",
      password: "superadmin123", // In real DB this is hashed with bcryptjs
      role: "superadmin",
      phone: "081234567890",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Kepala Seksi Pemberdayaan Ekonomi Masyarakat Kelurahan Korowelang Kulon."
    },
    {
      id: 2,
      name: "Budi Santoso (Admin Staff)",
      email: "admin@korowelangkulon.desa.id",
      password: "admin123",
      role: "admin",
      phone: "081987654321",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bio: "Staff Pendamping UMKM Kelurahan Korowelang Kulon."
    },
    {
      id: 3,
      name: "Siti Rahma (Admin Staff)",
      email: "siti@korowelangkulon.desa.id",
      password: "admin123",
      role: "admin",
      phone: "085712345678",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      bio: "Staff Administrasi & Publikasi UMKM Desa."
    }
  ],

  umkms: [
    {
      id: 1,
      name: "Bandeng Presto Khas Korowelang",
      owner: "H. Ahmad Subechi",
      category: "Kuliner",
      address: "RT 02 / RW 01, Dusun Karanganyar, Desa Korowelang Kulon",
      phone: "6281229988771",
      whatsapp: "6281229988771",
      gmapsUrl: "https://maps.google.com/?q=-6.912345,110.123456",
      gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
      description: "Produsen olahan bandeng presto duri lunak resep warisan keluarga Korowelang Kulon sejak 1998. Diolah higienis dengan bumbu rempah alami pilihan.",
      landingText: "Cita rasa bandeng presto gurih, lezat, dan tanpa pengawet asli pesisir Korowelang Kulon.",
      profileImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
      bannerImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
      rating: 4.9,
      reviewCount: 48,
      createdAt: "2024-01-15T08:00:00.000Z"
    },
    {
      id: 2,
      name: "Batik Tulis Pesisir Korowelang",
      owner: "Ibu Hj. Maryam",
      category: "Kerajinan & Fashion",
      address: "RT 04 / RW 02, Jalan Utama Korowelang Kulon No. 45",
      phone: "6285640112233",
      whatsapp: "6285640112233",
      gmapsUrl: "https://maps.google.com/?q=-6.914444,110.125555",
      gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
      description: "Pengrajin batik motif pesisiran khas Korowelang Kulon dengan perpaduan warna cerah motif bahari dan floramorfis.",
      landingText: "Batik tulis eksklusif karya tangan ibu-ibu pengrajin lokal Korowelang Kulon.",
      profileImage: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80",
      bannerImage: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80",
      rating: 4.8,
      reviewCount: 35,
      createdAt: "2024-02-01T09:30:00.000Z"
    },
    {
      id: 3,
      name: "Emping Melinjo Super Korowelang",
      owner: "Pak Suparno",
      category: "Makanan Ringan",
      address: "RT 01 / RW 03, Dusun Dukuh Kulon, Korowelang Kulon",
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
      createdAt: "2024-02-10T11:15:00.000Z"
    },
    {
      id: 4,
      name: "Anyaman Bambu & Craft Korowelang",
      owner: "Kang Tarjo",
      category: "Kerajinan & Fashion",
      address: "RT 03 / RW 01, Dusun Bambu Asri, Korowelang Kulon",
      phone: "6287733445566",
      whatsapp: "6287733445566",
      gmapsUrl: "https://maps.google.com/?q=-6.918888,110.129999",
      gmapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.695724128522!2d110.145000!3d-6.890000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjQuMCJTIDExMMKwMDgnNDI0LjAiRQ!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid",
      description: "Aneka kerajinan tempat makanan, hampers, tas etnik, dan perabot ramah lingkungan berbahan dasar bambu lokal.",
      landingText: "Kerajinan tangan seni anyaman bambu bernilai estetika tinggi.",
      profileImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      bannerImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
      rating: 4.7,
      reviewCount: 29,
      createdAt: "2024-03-05T14:20:00.000Z"
    }
  ],

  products: [
    {
      id: 1,
      umkmId: 1,
      name: "Bandeng Presto Kemasan Vakum (Isi 2 Ekor)",
      price: 35000,
      unit: "pack",
      description: "Bandeng duri lunak plus sambal terasi pedas manis khas Korowelang. Tahan hingga 14 hari di suhu ruangan.",
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
    },
    {
      id: 3,
      umkmId: 2,
      name: "Kain Batik Tulis Motif Pesisiran (2x1.15m)",
      price: 350000,
      unit: "pcs",
      description: "Kain katun prima halus berpewarna sintesis tahan pudar dengan cetakan motif khas pantai Korowelang.",
      image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 4,
      umkmId: 2,
      name: "Kemeja Batik Pria Lengan Pendek",
      price: 220000,
      unit: "pcs",
      description: "Kemeja batik katun berlapis furing halus, nyaman untuk kerja maupun acara formal.",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 5,
      umkmId: 3,
      name: "Emping Melinjo Matang Pedas Manis (250g)",
      price: 28000,
      unit: "bungkus",
      description: "Emping melinjo digoreng renyah dibalut bumbu karamel cabai asli.",
      image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 6,
      umkmId: 3,
      name: "Emping Melinjo Mentah Super (1kg)",
      price: 85000,
      unit: "kg",
      description: "Emping melinjo mentah kualitas A1, tipis, krispi saat digoreng.",
      image: "https://images.unsplash.com/photo-1621996346565-e3d5d6288344?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 7,
      umkmId: 4,
      name: "Rantang Anyaman Bambu Hampers",
      price: 45000,
      unit: "set",
      description: "Rantang bambu susun 2 ramah lingkungan untuk wadah bento atau hampers Lebaran.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80"
    }
  ],

  feedbacks: [
    {
      id: 1,
      name: "Ahmad Wijaya",
      email: "ahmad.w@gmail.com",
      message: "Bandeng presto khas Korowelang rasanya juara sekali! Sambalnya pas dan durinya benar-benar lunak.",
      createdAt: "2024-06-10T10:00:00.000Z"
    },
    {
      id: 2,
      name: "Dini Lestari",
      email: "dini.l@yahoo.com",
      message: "Website portal ini sangat membantu saya mencari batik tulis asli Korowelang Kulon langsung dari pengrajinnya.",
      createdAt: "2024-06-12T14:30:00.000Z"
    }
  ],

  dynamicContent: {
    siteName: "UMKM Korowelang Kulon",
    headerTitle: "Portal Pemberdayaan UMKM Desa Korowelang Kulon",
    headerSubtitle: "Mendukung Ekonomi Kreatif & Usaha Lokal Desa Pesisir Mandiri",
    logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80",
    heroTitle: "Jelajahi Produk Unggulan Karya Warga Korowelang Kulon",
    heroSubtitle: "Dari Kuliner Bandeng Presto hingga Batik Pesisir Tradisional. Dapatkan produk berkualitas langsung dari pelaku usaha desa kami.",
    heroBannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    aboutTitle: "Tentang Program UMKM Desa Korowelang Kulon",
    aboutText: "Desa Korowelang Kulon merupakan desa pesisir yang kaya akan potensi produk olahan hasil laut, industri makanan ringan, hingga kerajinan seni batik pesisiran. Portal ini hadir sebagai wadah digitalisasi resmi yang dikelola oleh Pemerintah Kelurahan Korowelang Kulon untuk memasarkan dan memperkenalkan potensi lokal secara luas ke seluruh Indonesia.",
    villageAddress: "Jl. Raya Korowelang Kulon No. 01, Kec. Cepiring, Kabupaten Kendal, Jawa Tengah",
    contactEmail: "info@korowelangkulon.desa.id",
    contactPhone: "(0294) 381000 / 0812-3456-7890",
    footerText: "© 2026 Pemerintah Desa Korowelang Kulon. Hak Cipta Dilindungi Undang-Undang."
  }
};

module.exports = mockData;
