'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Check, Image as ImageIcon, Layout, Info, MapPin } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { fetchDynamicContent } from '@/lib/api';
import { DynamicContent } from '@/lib/types';

export default function SuperAdminKontenPage() {
  const [siteName, setSiteName] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerSubtitle, setHeaderSubtitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBannerUrl, setHeroBannerUrl] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [villageAddress, setVillageAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [footerText, setFooterText] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchDynamicContent().then((c) => {
      setSiteName(c.siteName);
      setHeaderTitle(c.headerTitle);
      setHeaderSubtitle(c.headerSubtitle);
      setLogoUrl(c.logoUrl);
      setHeroTitle(c.heroTitle);
      setHeroSubtitle(c.heroSubtitle);
      setHeroBannerUrl(c.heroBannerUrl);
      setAboutTitle(c.aboutTitle);
      setAboutText(c.aboutText);
      setVillageAddress(c.villageAddress);
      setContactEmail(c.contactEmail);
      setContactPhone(c.contactPhone);
      setFooterText(c.footerText);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedContent: DynamicContent = {
      siteName,
      headerTitle,
      headerSubtitle,
      logoUrl,
      heroTitle,
      heroSubtitle,
      heroBannerUrl,
      aboutTitle,
      aboutText,
      villageAddress,
      contactEmail,
      contactPhone,
      footerText,
    };

    // Save to local storage for instant client reflection
    if (typeof window !== 'undefined') {
      localStorage.setItem('umkm_dynamic_content', JSON.stringify(updatedContent));
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Konten Dinamis Website</h1>
          <p className="text-xs text-gray-500">Form pengubahan teks header, logo, banner landing page, halaman tentang, dan teks footer.</p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Konten website berhasil diperbarui secara langsung!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* SECTION 1: HEADER & LOGO */}
          <SoftCard className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Layout className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">1. Identitas Website & Navbar Logo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SoftInput label="Nama Website / Portal" value={siteName} onChange={e => setSiteName(e.target.value)} required />
              <ImageUploadInput label="Logo Balai Desa" value={logoUrl} onChange={setLogoUrl} />
            </div>

            <SoftInput label="Judul Utama Header / Tagline Navbar" value={headerTitle} onChange={e => setHeaderTitle(e.target.value)} />
            <SoftInput label="Sub-Judul / Deskripsi Singkat Header" value={headerSubtitle} onChange={e => setHeaderSubtitle(e.target.value)} />
          </SoftCard>

          {/* SECTION 2: LANDING PAGE HERO */}
          <SoftCard className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">2. Konten Hero Section Landing Page</h2>
            </div>

            <SoftInput label="Judul Banner Utama (Hero Title)" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} required />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 ml-1">Sub-Judul / Deskripsi Hero</label>
              <textarea
                rows={3}
                className="soft-input w-full p-3 text-sm rounded-2xl"
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
              />
            </div>

            <ImageUploadInput label="Image Banner Hero Landing Page" value={heroBannerUrl} onChange={setHeroBannerUrl} />
          </SoftCard>

          {/* SECTION 3: ABOUT PAGE CONTENT */}
          <SoftCard className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Info className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-800">3. Isi Halaman Tentang Desa</h2>
            </div>

            <SoftInput label="Judul Halaman Tentang" value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 ml-1">Teks Penjelasan Visi & Potensi Desa</label>
              <textarea
                rows={5}
                className="soft-input w-full p-3 text-sm rounded-2xl"
                value={aboutText}
                onChange={e => setAboutText(e.target.value)}
              />
            </div>
          </SoftCard>

          {/* SECTION 4: FOOTER & CONTACT INFO */}
          <SoftCard className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">4. Kontak Balai Desa & Teks Footer</h2>
            </div>

            <SoftInput label="Alamat Balai Kelurahan" value={villageAddress} onChange={e => setVillageAddress(e.target.value)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SoftInput label="Email Kontak Kelurahan" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              <SoftInput label="Telepon / WA Kontak Kelurahan" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>

            <SoftInput label="Teks Copyright Footer" value={footerText} onChange={e => setFooterText(e.target.value)} />
          </SoftCard>

          {/* SUBMIT BUTTON */}
          <SoftButton type="submit" variant="primary" size="lg" className="w-full shadow-lg" icon={<Check className="w-5 h-5" />}>
            Simpan Perubahan Konten Website
          </SoftButton>

        </form>

      </main>
    </div>
  );
}
