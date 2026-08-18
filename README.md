# 🏪 UMKM Desa Korowelang Kulon - Full-Stack Web Portal

Wadah digitalisasi resmi dan portal UMKM Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal, Jawa Tengah.

Aplikasi ini mengusung desain **Modern Neumorphism / Soft UI Clean Aesthetic** yang terinspirasi dari antarmuka modern (skema warna soft grey-blue, dual drop shadow, tombol gradien biru royal, dan layout card presisi).

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Axios](https://axios-http.com/) Interceptor, Lucide/Heroicons Soft UI Icons.
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [JWT (JSON Web Token)](https://jwt.io/), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js).
- **Database & ORM**: [PostgreSQL (Supabase / Neon)](https://supabase.com/), [Drizzle ORM](https://orm.drizzle.team/), `drizzle-kit`.
- **Deployment**: [Vercel](https://vercel.com/) (Serverless Architecture).

---

## 🏗️ Struktur Project

```text
UMKM KOROWELANG KULON/
├── backend/                         # RESTful API Node.js (Express.js)
│   ├── src/
│   │   ├── config/                  # Konfigurasi JWT, CORS, dsb
│   │   ├── controllers/             # Public, Admin, Superadmin, & Export Controllers
│   │   ├── data/                    # Stateful Mock DB & Seed Data
│   │   ├── db/                      # Drizzle ORM (schema.js, index.js, seed.js, syncSequences.js)
│   │   ├── middleware/              # JWT Auth, Role-based Access Control, Rate Limiter
│   │   ├── routes/                  # API Routes (/api/public, /api/auth, /api/admin, /api/superadmin)
│   │   ├── utils/                   # Helper Bcrypt Hashing, Password & Validation
│   │   └── server.js                # Server Entrypoint
│   ├── drizzle.config.js            # Konfigurasi Drizzle Kit Migration
│   ├── vercel.json                  # Konfigurasi Serverless Node di Vercel
│   └── package.json
│
├── frontend/                        # Next.js 14 App Router + Tailwind Soft UI
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Public Landing Page
│   │   │   ├── umkm/                # Katalog UMKM & Halaman Detail
│   │   │   ├── tentang/             # Halaman Profil Desa & UMKM
│   │   │   ├── feedback/            # Halaman Formulir Masukan Warga
│   │   │   ├── login/               # Halaman Login Admin & Super Admin
│   │   │   ├── admin/               # Dashboard Admin Staff (Kelola UMKM, Produk, Feedback)
│   │   │   └── superadmin/          # Dashboard Super Admin (Kelola Admin & Konten Dinamis)
│   │   ├── components/              # Komponen Neumorphism / Soft UI
│   │   └── lib/                     # Axios Instance, API Client, TypeScript Types
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── push.bat                         # Otomatisasi Git Commit & Push ke GitHub
└── run.bat                          # Menjalankan Frontend & Backend secara bersamaan
```

---

## ⚡ Fitur Utama Berdasarkan Aktor

### 1. Sisi User (Masyarakat Umum / Publik)

- **Landing Page Interaktif**: Banner hero dinamis, highlight produk unggulan, statistik desa, dan pencarian cepat.
- **Katalog UMKM & Filter**: Pencarian interaktif & filter kategori usaha (*Kuliner, Makanan Ringan, Kerajinan & Fashion, Jasa*).
- **Detail Profil UMKM**: Galeri produk lengkap, alamat, rating pembeli, **embed Google Maps interaktif**, dan **tombol CTA "Hubungi via WhatsApp"** langsung ke kontak penjual.
- **Halaman Tentang Desa**: Profil resmi pemberdayaan ekonomi masyarakat Desa Korowelang Kulon.
- **Halaman Feedback**: Form pengiriman masukan & aspirasi warga kepada balai kelurahan.

### 2. Sisi Admin (Dashboard Staff Kelurahan)

- **Overview Dashboard**: Statistik ringkasan jumlah UMKM terdaftar, total produk, dan pesan feedback.
- **Kelola Data UMKM**: Tambah UMKM baru, edit detail usaha, update kontak WhatsApp, koordinat Google Maps, foto profil & banner.
- **Kelola Katalog Produk**: Tambah varian produk, harga jual (Rp), deskripsi, dan foto produk.
- **Kelola Profil Akun**: Edit nama, kontak, biodata, dan avatar akun admin.
- **Moderasi Feedback**: Melihat dan menindaklanjuti pesan & masukan dari masyarakat.

### 3. Sisi Super Admin (Master Dashboard)

- **Semua Hak Akses Admin Staff**.
- **Kelola Akun Admin Staff**: Tambah akun admin baru, ubah hak akses, reset password, atau nonaktifkan akun admin.
- **Kelola Konten Web Dinamis**: Kustomisasi logo desa, nama portal, teks header/navbar, banner landing page, narasi tentang desa, kontak kelurahan, serta teks footer secara langsung.
- **Audit Log & Laporan**: Monitoring log aktivitas sistem dan ekspor data UMKM/Produk ke format Excel/PDF.

---

## 👤 Akun Kredensial Default

Setelah menjalankan script seed ke database, berikut akun yang tersedia:

| Role | Email | Password Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@korowelangkulon.desa.id` | `superadmin123` | Master Control (Semua fitur + Akun Admin + Konten Web) |
| **Admin Staff** | `admin@korowelangkulon.desa.id` | `admin123` | Kelola UMKM, Katalog Produk, dan Feedback |

---

## 🚀 Panduan Menjalankan di Lokal (Development)

### 1. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend/`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super-secret-jwt-key-umkm-korowelang-kulon-2026
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host:port/database
```

Jalankan migrasi database & seed:

```bash
npm run db:push   # Mendorong struktur tabel ke database PostgreSQL
npm run seed      # Mengisi data awal UMKM, Produk, dan Akun Admin
npm run dev       # Menjalankan server backend di http://localhost:5000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env.local` di dalam folder `frontend/`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-korowelang-kulon-umkm-hub-2026
```

Jalankan server frontend:

```bash
npm run dev       # Menjalankan frontend di http://localhost:3000
```

---

## 🌐 Panduan Deployment Vercel (Production)

### 1. Environment Variables - Backend (Vercel Project Backend)

| Variable Name | Nilai / Contoh | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.xxx:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres` | Connection string PostgreSQL Supabase / Neon |
| `JWT_SECRET` | `k0r0w3lang_kulon_sup3r_s3cur3_jwt_2026_xYz` | Kunci rahasia hashing token JWT (min. 32 karakter) |
| `FRONTEND_URL` | `https://umkm-desa-korowelang-kulon-lac.vercel.app` | URL Vercel Frontend untuk konfigurasi CORS |
| `NODE_ENV` | `production` | Mode produksi |
| `CLOUDINARY_CLOUD_NAME` | `nama_cloud_anda` *(opsional)* | Cloudinary untuk upload media |
| `CLOUDINARY_API_KEY` | `api_key_anda` *(opsional)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `api_secret_anda` *(opsional)* | Cloudinary API Secret |

### 2. Environment Variables - Frontend (Vercel Project Frontend)

| Variable Name | Nilai / Contoh | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | `https://nama-backend-anda.vercel.app` | URL domain Backend Vercel *(tanpa garis miring di akhir)* |
| `NEXTAUTH_URL` | `https://umkm-desa-korowelang-kulon-lac.vercel.app` | URL domain Frontend Vercel |
| `NEXTAUTH_SECRET` | `korowelang-frontend-secret-auth-2026` | Secret key enkripsi session auth |

### 3. Pengujian Koneksi (Health Check)

Setelah deploy, periksa endpoint backend:

```text
GET https://nama-backend-anda.vercel.app/api/health
```

Jika respon menampilkan `"database": "Supabase PostgreSQL Connected"`, sistem dan database telah terintegrasi sempurna!