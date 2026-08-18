# 🏪 UMKM Desa Korowelang Kulon - Full-Stack Web Portal

Wadah digitalisasi resmi dan portal UMKM Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal, Jawa Tengah.

Aplikasi ini mengusung desain **Modern Neumorphism / Soft UI Clean Aesthetic** yang terinspirasi dari antarmuka modern (skema warna soft grey-blue, dual drop shadow, tombol gradien biru royal, dan layout card presisi).

---

## 🏗️ Struktur Project

Aplikasi ini dipisahkan menjadi 2 direktori utama:
- [`/frontend`](./frontend): Aplikasi web antarmuka pengguna berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **Axios Interceptor**.
- [`/backend`](./backend): RESTful API Server berbasis **Node.js (Express.js)**, **JWT Authentication**, dan Layered MVC Architecture.

```text
UMKM KOROWELANG KULON/
├── backend/                  # RESTful API Node.js (Express.js)
│   ├── src/
│   │   ├── config/           # Config JWT & Secret Keys
│   │   ├── data/             # Stateful Mock DB (UMKM, Produk, Feedback, Dynamic Content)
│   │   ├── middleware/       # JWT Auth & Role Access Control (Admin & Super Admin)
│   │   ├── controllers/      # Public, Admin, & Super Admin Controllers
│   │   ├── routes/           # Router (/api/public, /api/admin, /api/superadmin)
│   │   └── server.js         # Entry Point Express Server
│   ├── package.json
│   └── README.md             # Dokumentasi API Lengkap
│
└── frontend/                 # Next.js 14 App Router + Tailwind Soft UI
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                  # Public Landing Page
    │   │   ├── umkm/                     # Public UMKM Catalog & Detail Pages
    │   │   ├── tentang/                  # Public About Page
    │   │   ├── feedback/                 # Public Feedback Form Page
    │   │   ├── login/                    # Login Page Staff Admin
    │   │   ├── admin/                    # Admin Dashboard (UMKM, Produk, Profil, Feedback)
    │   │   └── superadmin/               # Super Admin Dashboard (Akun Staff, Edit Konten)
    │   ├── components/                   # Neumorphic Soft UI Design System Components
    │   └── lib/                          # Axios Client, Interceptors, & TypeScript Types
    ├── tailwind.config.js
    └── package.json


## ⚡ Fitur Utama Berdasarkan Aktor

### 1. Sisi User (Masyarakat Umum / Public)
- **Landing Page**: Banner hero dinamis, highlight produk unggulan, statistik desa, dan tombol CTA.
- **Katalog UMKM**: Pencarian interaktif & filter kategori usaha (Kuliner, Makanan Ringan, Kerajinan & Fashion, Jasa).
- **Detail UMKM**: Galeri produk, alamat, rating pembeli, **embed Google Maps interaktif**, dan **tombol CTA "Hubungi via WhatsApp"** yang otomatis membuka percakapan dengan pemilik usaha.
- **Halaman Tentang**: Profil resmi pemberdayaan ekonomi masyarakat Desa Korowelang Kulon.
- **Halaman Feedback**: Form pengiriman masukan & saran warga ke balai kelurahan.

### 2. Sisi Admin (Dashboard Staff Kelurahan)
- **Overview Dashboard**: Ringkasan jumlah UMKM, total produk, dan feedback terdaftar.
- **Kelola UMKM**: Pendaftaran UMKM baru, edit detail usaha, update kontak WhatsApp, lokasi G-Maps, serta foto profil & banner.
- **Kelola Produk UMKM**: Manajemen varian produk, harga jual (Rp), dan foto produk pada masing-masing UMKM.
- **Kelola Profil**: Edit biodata, kontak, dan avatar akun admin.
- **Lihat Feedback**: Tabel pesan & masukan dari masyarakat.

### 3. Sisi Super Admin (Master Dashboard)
- **Semua Fitur Admin Staff**.
- **Kelola Akun Admin Staff**: Tambah, edit hak akses role, atau hapus akun admin staff kelurahan.
- **Kelola Konten Dinamis**: Form langsung untuk merubah logo balai desa, nama portal, teks header/navbar, hero title & banner landing page, isi halaman tentang, kontak balai desa, serta copyright footer.

---

## 🚀 Cara Menjalankan Project

### 1. Menjalankan Backend (REST API Server)
```bash
cd backend
npm install
npm run dev
```
Backend berjalan di: `http://localhost:5000` (API status: `http://localhost:5000/api`)

### 2. Menjalankan Frontend (Next.js App Router)
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:3000`
