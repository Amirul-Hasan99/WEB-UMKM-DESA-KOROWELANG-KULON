# 🏪 Backend RESTful API - UMKM Desa Korowelang Kulon

RESTful API Server untuk Portal Usaha Mikro, Kecil, dan Menengah (UMKM) Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal.

Dibangun dengan **Node.js (Express.js)** menggunakan arsitektur berlapis (MVC) dan otentikasi berbasis **JSON Web Token (JWT)** untuk mengelola 3 jenis aktor: **Public User**, **Admin Staff**, dan **Super Admin**.

---

## 🛠️ Tech Stack & Arsitektur

- **Runtime & Framework**: Node.js & Express.js
- **Autentikasi & Otorisasi**: JSON Web Token (JWT) & bcryptjs
- **CORS & Middleware**: Cors, Express JSON Parser, Role Authorization Middleware
- **Structure**: Layered MVC (Routes -> Middlewares -> Controllers -> Stateful Data Store)

---

## 🔑 Default Accounts (Akun Pengujian)

Gunakan akun dummy berikut untuk masuk ke dashboard Admin dan Super Admin:

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Super Admin** | `superadmin@korowelangkulon.desa.id` | `superadmin123` | Akses Penuh (Kelola Admin, Kelola UMKM, Kelola Produk, Edit Konten Website Dinamis) |
| **Admin Staff** | `admin@korowelangkulon.desa.id` | `admin123` | Kelola UMKM, Kelola Produk, Edit Profil Admin, Lihat Feedback |
| **Admin Staff** | `siti@korowelangkulon.desa.id` | `admin123` | Kelola UMKM, Kelola Produk, Edit Profil Admin, Lihat Feedback |

---

## 🚀 Cara Menjalankan Project Secara Lokal

### 1. Prasyarat
- Node.js versi 18+ atau yang lebih baru
- Terminal / Command Prompt

### 2. Install Dependencies
Buka terminal di folder `backend` dan jalankan:
```bash
cd backend
npm install
```

### 3. Environment Variables (Opsional)
Buat file `.env` di folder `backend` (jika ingin mengubah port atau JWT secret):
```env
PORT=5000
JWT_SECRET=korowelang_kulon_super_secret_jwt_key_2026
NODE_ENV=development
```

### 4. Jalankan Server
```bash
# Mode Development (Live reload)
npm run dev

# Mode Production
npm start
```
Server akan berjalan di: `http://localhost:5000`

---

## 📚 Dokumentasi API Endpoints

### 1. Public API (Tanpa Autentikasi)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/public/umkm` | Mengambil daftar UMKM (bisa dengan query `?search=` & `?category=`) |
| `GET` | `/api/public/umkm/:id` | Mengambil detail UMKM beserta daftar produknya |
| `GET` | `/api/public/konten` | Mengambil konten dinamis website (header, footer, logo, hero, tentang) |
| `POST` | `/api/public/feedback` | Mempublikasikan feedback dari masyarakat (`name`, `email`, `message`) |

### 2. Admin API (Membutuhkan Token Authorization `Bearer <token>`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/admin/login` | Login Admin / Super Admin (Mengembalikan JWT Token) |
| `GET` | `/api/admin/profile` | Mengambil data profil Admin yang sedang login |
| `PUT` | `/api/admin/profile` | Mengubah nama, telp, bio, atau foto profil Admin |
| `GET` | `/api/admin/umkm` | Menampilkan seluruh UMKM terdaftar |
| `POST` | `/api/admin/umkm` | Menambah UMKM baru (profil, gmaps, deskripsi, kontak) |
| `PUT` | `/api/admin/umkm/:id` | Mengubah detail data UMKM |
| `DELETE` | `/api/admin/umkm/:id` | Menghapus UMKM dan produk terkait |
| `GET` | `/api/admin/produk` | Menampilkan produk (`?umkmId=` opsional) |
| `POST` | `/api/admin/produk` | Menambah produk baru ke UMKM tertentu |
| `PUT` | `/api/admin/produk/:id` | Mengubah detail produk |
| `DELETE` | `/api/admin/produk/:id` | Menghapus produk |
| `GET` | `/api/admin/feedback` | Melihat seluruh pesan feedback masyarakat |

### 3. Super Admin API (Membutuhkan Token Authorization `Bearer <token>` & Role `superadmin`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/superadmin/admins` | Melihat seluruh akun Admin kelurahan |
| `POST` | `/api/superadmin/admins` | Menambah akun Admin kelurahan baru |
| `PUT` | `/api/superadmin/admins/:id` | Mengubah status/detail akun Admin |
| `DELETE` | `/api/superadmin/admins/:id` | Menghapus akun Admin kelurahan |
| `PUT` | `/api/superadmin/konten` | Mengubah konten dinamis website (logo, header, footer, landing page, tentang) |
