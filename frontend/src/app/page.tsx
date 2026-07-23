'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, ArrowRight, Star, ShieldCheck, MapPin, Award, PhoneCall, Sparkles, ShoppingBag } from '@/components/Icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';
import { fetchDynamicContent, fetchUmkms } from '@/lib/api';
import { DynamicContent, UMKM } from '@/lib/types';

export default function LandingPage() {
  const [content, setContent] = useState<DynamicContent | null>(null);
  const [umkms, setUmkms] = useState<UMKM[]>([]);

  useEffect(() => {
    fetchDynamicContent().then(setContent);
    fetchUmkms().then(setUmkms);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-8 flex flex-col gap-16">
        
        {/* HERO SECTION */}
        <section className="relative pt-6 pb-4">
          <SoftCard className="relative overflow-hidden p-8 md:p-14 bg-gradient-to-br from-[#eef2f6] to-[#e2e8f0]">
            
            {/* Background Decorative Pill Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-7 flex flex-col gap-6">

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {content?.heroTitle || 'Jelajahi Produk Unggulan Karya Warga Korowelang Kulon'}
                </h1>

                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl font-medium">
                  {content?.heroSubtitle || 'Dari Kuliner Ikan Asap hingga Olahan Ikan. Dapatkan produk berkualitas langsung dari UMKM desa kami.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/umkm">
                    <SoftButton variant="primary" size="lg" icon={<Store className="w-5 h-5" />}>
                      Lihat Semua UMKM
                    </SoftButton>
                  </Link>
                  <Link href="/tentang">
                    <SoftButton variant="default" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                      Tentang Program
                    </SoftButton>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-300/60">
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-blue-600">100%</span>
                    <span className="text-xs font-semibold text-gray-500">Asli Produk Desa</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-blue-600">Kontak</span>
                    <span className="text-xs font-semibold text-gray-500">Hubungi via WA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-blue-600">Binaan</span>
                    <span className="text-xs font-semibold text-gray-500">Balai Desa Korowelang Kulon</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Hero Graphic Banner / Soft Card UI showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="soft-card p-4 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300">
                    <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-4">
                      <img
                        src={content?.heroBannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                        alt="Hero Banner UMKM"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <span className="text-white text-xs font-bold bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          Potensi Ekonomi Pesisir
                        </span>
                      </div>
                    </div>

                    <div className="p-2 flex flex-col gap-2">
                      <h3 className="font-extrabold text-gray-800 text-base">Produk Olahan Laut & Kerajinan Tangan</h3>
                      <p className="text-xs text-gray-500 font-medium">Mendorong kemandirian ekonomi masyarakat pesisir Korowelang Kulon.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </SoftCard>
        </section>

        {/* ABOUT DESA SNIPPET */}
        <section className="flex flex-col gap-6">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Sekilas Tentang Desa</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {content?.aboutTitle || 'Tentang Program UMKM Korowelang Kulon'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              {content?.aboutText || 'Desa Korowelang Kulon merupakan desa pesisir yang kaya akan potensi produk olahan hasil laut, industri makanan ringan, hingga kerajinan seni batik pesisiran.'}
            </p>
          </div>
        </section>

        {/* HIGHLIGHT UMKM CARDS */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Unggulan Local Hero</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                UMKM Pilihan Desa
              </h2>
            </div>
            <Link href="/umkm">
              <SoftButton variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Lihat Selengkapnya
              </SoftButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {umkms.slice(0, 3).map((umkm) => (
              <SoftCard key={umkm.id} className="flex flex-col gap-4 group">
                
                {/* Profile Banner */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-200">
                  <img
                    src={umkm.profileImage}
                    alt={umkm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{umkm.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider">
                    {umkm.category}
                  </div>
                </div>

                {/* Info Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {umkm.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Pemilik: {umkm.owner}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                    {umkm.landingText || umkm.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{umkm.address}</span>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between gap-3">
                  <Link href={`/umkm/${umkm.id}`} className="w-full">
                    <SoftButton variant="primary" size="sm" className="w-full" icon={<ShoppingBag className="w-4 h-4" />}>
                      Detail & Produk
                    </SoftButton>
                  </Link>
                </div>

              </SoftCard>
            ))}
          </div>
        </section>

        {/* FEEDBACK CTA BANNER */}
        <section className="pt-4">
          <SoftCard className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Layanan Suara Warga
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Aspirasi & Feedback Masyarakat</h3>
              <p className="text-sm text-gray-600 max-w-xl font-medium leading-relaxed">
                Punya saran atau pertanyaan mengenai pengembangan UMKM di Desa Korowelang Kulon? Sampaikan langsung ke staff kami.
              </p>
            </div>
            <Link href="/feedback" className="shrink-0">
              <SoftButton variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Kirim Feedback
              </SoftButton>
            </Link>
          </SoftCard>
        </section>

      </main>

      <Footer />
    </div>
  );
}
