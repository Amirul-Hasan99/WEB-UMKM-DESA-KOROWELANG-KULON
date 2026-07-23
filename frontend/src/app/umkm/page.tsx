'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, MapPin, Store, ShoppingBag, PhoneCall } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { fetchUmkms } from '@/lib/api';
import { UMKM } from '@/lib/types';

export default function UmkmCatalogPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const categories = ['Semua', 'Kuliner', 'Makanan Ringan', 'Kerajinan & Fashion', 'Jasa'];

  useEffect(() => {
    setLoading(true);
    fetchUmkms(search, selectedCategory).then((data) => {
      setUmkms(data);
      setLoading(false);
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-10 flex flex-col gap-8">
        
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full soft-card-sm text-xs font-bold text-blue-600 self-start">
            <Store className="w-4 h-4" />
            Katalog Usaha Desa
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Daftar UMKM Korowelang Kulon
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-2xl">
            Temukan berbagai usaha mikro lokal, dari hidangan laut olahan bandeng presto, kerajinan batik tulis pesisir, hingga camilan khas desa.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <SoftCard className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:flex-1">
            <SoftInput
              placeholder="Cari UMKM, produk, atau nama pemilik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Category Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'soft-button-primary'
                    : 'soft-button text-gray-600 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SoftCard>

        {/* UMKM Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl soft-card bg-gray-200" />
            ))}
          </div>
        ) : umkms.length === 0 ? (
          <SoftCard className="p-12 text-center flex flex-col items-center gap-4">
            <Store className="w-12 h-12 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-700">Tidak ada UMKM ditemukan</h3>
            <p className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
            <SoftButton variant="primary" size="sm" onClick={() => { setSearch(''); setSelectedCategory('Semua'); }}>
              Reset Filter
            </SoftButton>
          </SoftCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {umkms.map((umkm) => (
              <SoftCard key={umkm.id} className="flex flex-col gap-4 group">
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

                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {umkm.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">Pemilik: {umkm.owner}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {umkm.landingText || umkm.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{umkm.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200/80 flex items-center gap-3">
                  <Link href={`/umkm/${umkm.id}`} className="flex-1">
                    <SoftButton variant="primary" size="sm" className="w-full" icon={<ShoppingBag className="w-4 h-4" />}>
                      Detail & Produk
                    </SoftButton>
                  </Link>
                  <a
                    href={`https://wa.me/${umkm.whatsapp}?text=Halo%20${encodeURIComponent(umkm.name)},%20saya%20tertarik%20dengan%20produk%20Anda.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SoftButton variant="default" size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-sm" icon={<PhoneCall className="w-4 h-4" />}>
                      WA
                    </SoftButton>
                  </a>
                </div>
              </SoftCard>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
