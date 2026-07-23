'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Store, Heart } from '@/components/Icons';
import { fetchDynamicContent } from '@/lib/api';
import { DynamicContent } from '@/lib/types';

export const Footer: React.FC = () => {
  const [content, setContent] = useState<DynamicContent | null>(null);

  useEffect(() => {
    fetchDynamicContent().then(setContent);
  }, []);

  return (
    <footer className="mt-20 border-t border-white/60 bg-[#eef2f6] pt-14 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Col 1: Village Branding */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl soft-card flex items-center justify-center p-1 overflow-hidden">
              {content?.logoUrl ? (
                <img src={content.logoUrl} alt="Logo Desa" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Store className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <span className="font-extrabold text-lg text-gray-800">
              {content?.siteName || 'UMKM Korowelang Kulon'}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {content?.headerSubtitle || 'Portal pemberdayaan UMKM resmi Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal.'}
          </p>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Navigasi Halaman</h4>
          <ul className="flex flex-col gap-2.5 text-sm font-semibold text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">Beranda Utama</Link>
            </li>
            <li>
              <Link href="/umkm" className="hover:text-blue-600 transition-colors">Katalog UMKM Desa</Link>
            </li>
            <li>
              <Link href="/tentang" className="hover:text-blue-600 transition-colors">Tentang Program Desa</Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-blue-600 transition-colors">Kirim Feedback Masyarakat</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-blue-600 transition-colors text-blue-700 font-bold">Portal Login Staff Admin</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact Info */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Kontak Balai Desa</h4>
          <div className="flex flex-col gap-2.5 text-sm text-gray-600">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
              <span>{content?.villageAddress || 'Jl. Raya Korowelang Kulon No. 01, Kec. Cepiring, Kab. Kendal'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{content?.contactPhone || '(0294) 381000'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{content?.contactEmail || 'info@korowelangkulon.desa.id'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
        <p>{content?.footerText || '© 2026 Pemerintah Desa Korowelang Kulon.'}</p>
        <p className="flex items-center gap-1">
          Diberdayakan oleh <span className="font-bold text-gray-700">Warga Korowelang Kulon</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline ml-0.5" />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
