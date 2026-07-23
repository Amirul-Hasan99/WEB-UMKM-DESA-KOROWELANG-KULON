'use client';

import React, { useEffect, useState } from 'react';
import { Info, Award, Users, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SoftCard from '@/components/SoftCard';
import { fetchDynamicContent } from '@/lib/api';
import { DynamicContent } from '@/lib/types';

export default function AboutPage() {
  const [content, setContent] = useState<DynamicContent | null>(null);

  useEffect(() => {
    fetchDynamicContent().then(setContent);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-10 flex flex-col gap-12">
        
        {/* Title */}
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full soft-card-sm text-xs font-bold text-blue-600 self-start">
            <Info className="w-4 h-4" />
            Informasi Resmi Desa
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {content?.aboutTitle || 'Tentang Program UMKM Desa Korowelang Kulon'}
          </h1>
          <p className="text-base text-gray-600 font-medium leading-relaxed">
            Mengenal lebih dekat potensi ekonomi lokal, kerajinan seni pesisir, dan program digitalisasi balai kelurahan.
          </p>
        </div>

        {/* Main Content Card */}
        <SoftCard className="p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Profil & Visi Pemberdayaan
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {content?.aboutText || 'Desa Korowelang Kulon merupakan desa pesisir yang kaya akan potensi produk olahan hasil laut, industri makanan ringan, hingga kerajinan seni batik pesisiran. Portal ini hadir sebagai wadah digitalisasi resmi yang dikelola oleh Pemerintah Kelurahan Korowelang Kulon untuk memasarkan dan memperkenalkan potensi lokal secara luas ke seluruh Indonesia.'}
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Pemerintah Kelurahan Korowelang Kulon</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Kecamatan Cepiring, Kabupaten Kendal, Jawa Tengah</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-72 rounded-2xl overflow-hidden soft-card-inset p-2">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Desa Korowelang Kulon"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </SoftCard>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SoftCard className="p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Produk Unggulan</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Fokus pada pengembangan kualitas bandeng presto duri lunak, batik tulis pesisiran, serta olahan camilan emping melinjo super.
            </p>
          </SoftCard>

          <SoftCard className="p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Digitalisasi Kelurahan</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Memudahkan interaksi antara pembeli luar daerah dengan pelaku UMKM secara langsung via WhatsApp tanpa perantara.
            </p>
          </SoftCard>

          <SoftCard className="p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Pendampingan Usaha</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Staff balai desa siap memfasilitasi legalitas usaha, pelatihan kemasan, serta pemasaran berbasis teknologi modern.
            </p>
          </SoftCard>
        </div>

      </main>

      <Footer />
    </div>
  );
}
