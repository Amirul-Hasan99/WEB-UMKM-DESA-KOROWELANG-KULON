'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, Globe, Store, Package, ArrowRight } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';

export default function SuperAdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Welcome Super Admin Banner */}
        <SoftCard className="p-6 md:p-8 flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-xs font-extrabold self-start">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Hak Akses Master Super Admin</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Utama Kelurahan Korowelang Kulon
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl font-medium leading-relaxed">
            Anda memiliki kendali penuh atas manajemen akun staff kelurahan, pengaturan konten dinamis website, dan pendaftaran UMKM desa.
          </p>
        </SoftCard>

        {/* Core Control Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <SoftCard className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-lg text-gray-900">Kelola Akun Admin Staff</h3>
              <p className="text-xs text-gray-600">Tambah staff kelurahan baru, atur perizinan, atau perbarui kredensial login admin.</p>
            </div>
            <Link href="/superadmin/admins">
              <SoftButton variant="primary" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
                Kelola Akun Admin
              </SoftButton>
            </Link>
          </SoftCard>

          <SoftCard className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-lg text-gray-900">Kelola Konten Dinamis Website</h3>
              <p className="text-xs text-gray-600">Ubah teks header, footer, logo balai desa, banner landing page, dan deskripsi halaman tentang.</p>
            </div>
            <Link href="/superadmin/konten">
              <SoftButton variant="primary" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
                Edit Konten Website
              </SoftButton>
            </Link>
          </SoftCard>

        </div>

      </main>
    </div>
  );
}
