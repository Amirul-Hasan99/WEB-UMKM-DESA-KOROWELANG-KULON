'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Package, MessageSquare, Plus, ArrowRight, ShieldCheck, TrendingUp, Users } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';
import { fetchUmkms } from '@/lib/api';
import { UMKM } from '@/lib/types';

export default function AdminDashboardPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);

  useEffect(() => {
    fetchUmkms().then(setUmkms);
  }, []);

  const totalProducts = umkms.reduce((acc, u) => acc + (u.products?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Welcome Header - Fixed High Contrast Theme */}
        <SoftCard className="p-6 md:p-8 flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-xs font-extrabold self-start">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Dashboard Staff Kelurahan</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang di Portal Admin UMKM
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl font-medium leading-relaxed">
            Kelola pendaftaran usaha warga, perbarui katalog produk, dan pantau feedback masyarakat Desa Korowelang Kulon.
          </p>
        </SoftCard>

        {/* Overview Stat Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SoftCard className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase">Total UMKM</span>
              <span className="text-2xl font-extrabold text-gray-900">{umkms.length}</span>
            </div>
          </SoftCard>

          <SoftCard className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Produk</span>
              <span className="text-2xl font-extrabold text-gray-900">{totalProducts}</span>
            </div>
          </SoftCard>

          <SoftCard className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase">Aspirasi Feedback</span>
              <span className="text-2xl font-extrabold text-gray-900">2 Pesan</span>
            </div>
          </SoftCard>
        </div>

        {/* Quick Shortcuts */}
        <SoftCard className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-800">Aksi Cepat Manajemen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/umkm">
              <SoftButton variant="default" className="w-full justify-between py-4" icon={<Store className="w-5 h-5 text-blue-600" />}>
                <span>Kelola Data & Produk UMKM</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </SoftButton>
            </Link>

            <Link href="/admin/feedback">
              <SoftButton variant="default" className="w-full justify-between py-4" icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}>
                <span>Lihat Feedback User</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </SoftButton>
            </Link>
          </div>
        </SoftCard>

        {/* Recent UMKM Table */}
        <SoftCard className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Daftar UMKM Terbaru</h2>
            <Link href="/admin/umkm">
              <span className="text-xs font-bold text-blue-600 hover:underline">Kelola Semua</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase">
                  <th className="py-3 px-2">Nama UMKM</th>
                  <th className="py-3 px-2">Pemilik</th>
                  <th className="py-3 px-2">Kategori</th>
                  <th className="py-3 px-2">Kontak WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 font-medium">
                {umkms.slice(0, 4).map((umkm) => (
                  <tr key={umkm.id} className="hover:bg-white/40">
                    <td className="py-3 px-2 font-bold text-gray-900">{umkm.name}</td>
                    <td className="py-3 px-2 text-gray-600">{umkm.owner}</td>
                    <td className="py-3 px-2 text-blue-600 font-bold">{umkm.category}</td>
                    <td className="py-3 px-2 text-gray-500">{umkm.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SoftCard>

      </main>
    </div>
  );
}
