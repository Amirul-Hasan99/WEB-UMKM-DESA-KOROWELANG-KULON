'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Store, MapPin, PhoneCall, Star, ArrowLeft, ShieldCheck, ShoppingBag, MessageSquare, Award, Package, ExternalLink } from '@/components/Icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';
import { fetchUmkmById } from '@/lib/api';
import { UMKM } from '@/lib/types';

export default function UmkmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [umkm, setUmkm] = useState<UMKM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchUmkmById(id).then((data) => {
        setUmkm(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#eef2f6]">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-400/30 soft-card" />
            <p className="text-sm font-bold text-gray-500">Memuat Detail UMKM...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen flex flex-col bg-[#eef2f6]">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center gap-4">
          <Store className="w-16 h-16 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800">UMKM Tidak Ditemukan</h2>
          <SoftButton variant="primary" onClick={() => router.push('/umkm')}>
            Kembali ke Katalog UMKM
          </SoftButton>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-8 flex flex-col gap-10">
        
        {/* Back Button */}
        <div>
          <SoftButton variant="default" size="sm" onClick={() => router.push('/umkm')} icon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Daftar UMKM
          </SoftButton>
        </div>

        {/* HERO BANNER & UMKM PROFILE */}
        <SoftCard className="p-6 md:p-8 flex flex-col gap-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200">
            <img
              src={umkm.bannerImage || umkm.profileImage}
              alt={umkm.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
              <div className="flex flex-col gap-2 text-white">
                <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold self-start uppercase tracking-wider">
                  {umkm.category}
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold">{umkm.name}</h1>
                <p className="text-xs md:text-sm text-gray-200 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Pemilik: <span className="font-bold text-white">{umkm.owner}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Details & WhatsApp CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-gray-200/80 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Alamat Usaha</span>
              <p className="text-sm font-semibold text-gray-800 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {umkm.address}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Rating Pelanggan</span>
              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {umkm.rating} <span className="text-xs text-gray-500 font-normal">({umkm.reviewCount} ulasan pembeli)</span>
              </p>
            </div>

            <div className="flex justify-start md:justify-end">
              <a
                href={`https://wa.me/${umkm.whatsapp}?text=Halo%20${encodeURIComponent(umkm.name)},%20saya%20tertarik%20dengan%20produk%20Anda.`}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto"
              >
                <SoftButton
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  icon={<PhoneCall className="w-5 h-5" />}
                >
                  Hubungi via WhatsApp
                </SoftButton>
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-gray-900">Tentang Usaha Ini</h3>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {umkm.description}
            </p>
          </div>
        </SoftCard>

        {/* PRODUCTS CATALOG SECTION */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl soft-card-sm text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Daftar Produk Unggulan</h2>
          </div>

          {!umkm.products || umkm.products.length === 0 ? (
            <SoftCard className="p-8 text-center text-gray-500 text-sm">
              Belum ada produk yang didaftarkan untuk UMKM ini.
            </SoftCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {umkm.products.map((product) => (
                <SoftCard key={product.id} className="flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="h-44 rounded-xl overflow-hidden bg-gray-200">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{product.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Harga</span>
                      <span className="text-lg font-extrabold text-blue-600">
                        Rp {product.price.toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-gray-500"> / {product.unit}</span>
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${umkm.whatsapp}?text=Halo%20${encodeURIComponent(umkm.name)},%20saya%20ingin%20memesan%20produk:%20${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <SoftButton variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<PhoneCall className="w-4 h-4" />}>
                        Pesan
                      </SoftButton>
                    </a>
                  </div>
                </SoftCard>
              ))}
            </div>
          )}
        </section>

        {/* GOOGLE MAPS EMBED SECTION */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl soft-card-sm text-red-500">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Lokasi Google Maps</h2>
            </div>
            {umkm.gmapsUrl && (
              <a href={umkm.gmapsUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                Buka di App Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <SoftCard className="p-3 overflow-hidden rounded-3xl">
            {umkm.gmapsEmbed ? (
              <iframe
                src={umkm.gmapsEmbed}
                width="100%"
                height="360"
                style={{ border: 0, borderRadius: '1.25rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${umkm.name}`}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 rounded-2xl">
                Google Maps Embed belum dikonfigurasi untuk UMKM ini.
              </div>
            )}
          </SoftCard>
        </section>

      </main>

      <Footer />
    </div>
  );
}
