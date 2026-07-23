'use client';

import React, { useEffect, useState } from 'react';
import { Store, Plus, Edit2, Trash2, X, Check, MapPin, PhoneCall } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { fetchUmkms } from '@/lib/api';
import { UMKM } from '@/lib/types';

export default function AdminUmkmPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUmkm, setEditingUmkm] = useState<UMKM | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState('Kuliner');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gmapsUrl, setGmapsUrl] = useState('');
  const [gmapsEmbed, setGmapsEmbed] = useState('');
  const [description, setDescription] = useState('');
  const [landingText, setLandingText] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    fetchUmkms().then(setUmkms);
  }, []);

  const openAddModal = () => {
    setEditingUmkm(null);
    setName('');
    setOwner('');
    setCategory('Kuliner');
    setAddress('');
    setPhone('');
    setWhatsapp('');
    setGmapsUrl('');
    setGmapsEmbed('');
    setDescription('');
    setLandingText('');
    setProfileImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (umkm: UMKM) => {
    setEditingUmkm(umkm);
    setName(umkm.name);
    setOwner(umkm.owner);
    setCategory(umkm.category);
    setAddress(umkm.address);
    setPhone(umkm.phone);
    setWhatsapp(umkm.whatsapp);
    setGmapsUrl(umkm.gmapsUrl);
    setGmapsEmbed(umkm.gmapsEmbed);
    setDescription(umkm.description);
    setLandingText(umkm.landingText);
    setProfileImage(umkm.profileImage);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUmkm) {
      // Update existing local state
      setUmkms(prev =>
        prev.map(u =>
          u.id === editingUmkm.id
            ? {
                ...u,
                name,
                owner,
                category,
                address,
                phone,
                whatsapp,
                gmapsUrl,
                gmapsEmbed,
                description,
                landingText,
                profileImage: profileImage || u.profileImage,
              }
            : u
        )
      );
    } else {
      // Add new
      const newUmkm: UMKM = {
        id: umkms.length > 0 ? Math.max(...umkms.map(u => u.id)) + 1 : 1,
        name,
        owner,
        category,
        address: address || 'Desa Korowelang Kulon',
        phone,
        whatsapp: whatsapp || phone,
        gmapsUrl,
        gmapsEmbed,
        description,
        landingText,
        profileImage: profileImage || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        products: []
      };
      setUmkms(prev => [newUmkm, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus UMKM ini?')) {
      setUmkms(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelorta UMKM Terdaftar</h1>
            <p className="text-xs text-gray-500">Daftarkan usaha baru dan perbarui profil UMKM Korowelang Kulon.</p>
          </div>
          <SoftButton variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Daftarkan UMKM Baru
          </SoftButton>
        </div>

        {/* UMKM Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {umkms.map((umkm) => (
            <SoftCard key={umkm.id} className="flex flex-col justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
                  <img src={umkm.profileImage} alt={umkm.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{umkm.category}</span>
                  <h3 className="font-extrabold text-base text-gray-900 truncate">{umkm.name}</h3>
                  <p className="text-xs text-gray-600">Pemilik: {umkm.owner}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {umkm.address}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">WA: {umkm.whatsapp}</span>
                <div className="flex items-center gap-2">
                  <SoftButton variant="default" size="sm" onClick={() => openEditModal(umkm)} icon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit Detail
                  </SoftButton>
                  <SoftButton variant="danger" size="sm" onClick={() => handleDelete(umkm.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                    Hapus
                  </SoftButton>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>

        {/* MODAL FORM ADD/EDIT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto soft-card p-6 md:p-8 bg-[#eef2f6]">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingUmkm ? 'Edit Data UMKM' : 'Pendaftaran UMKM Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput label="Nama UMKM" value={name} onChange={e => setName(e.target.value)} required />
                  <SoftInput label="Nama Pemilik" value={owner} onChange={e => setOwner(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Kategori</label>
                    <select
                      className="soft-input w-full p-3 text-sm rounded-2xl"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Kuliner">Kuliner</option>
                      <option value="Makanan Ringan">Makanan Ringan</option>
                      <option value="Kerajinan & Fashion">Kerajinan & Fashion</option>
                      <option value="Jasa">Jasa</option>
                    </select>
                  </div>

                  <SoftInput label="Nomor WhatsApp (Contoh: 628123456789)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
                </div>

                <SoftInput label="Alamat Lengkap" value={address} onChange={e => setAddress(e.target.value)} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput label="URL Google Maps" value={gmapsUrl} onChange={e => setGmapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." />
                  <SoftInput label="Embed Iframe Google Maps" value={gmapsEmbed} onChange={e => setGmapsEmbed(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                </div>

                <ImageUploadInput label="Foto Profil / Logo UMKM" value={profileImage} onChange={setProfileImage} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Ringkasan Teks Landing Page</label>
                  <textarea
                    rows={2}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={landingText}
                    onChange={e => setLandingText(e.target.value)}
                    placeholder="Kalimat promosi singkat di card landing page..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Deskripsi Lengkap Usaha</label>
                  <textarea
                    rows={4}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Penjelasan detail sejarah, bahan baku, keunggulan..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <SoftButton type="button" variant="default" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </SoftButton>
                  <SoftButton type="submit" variant="primary" icon={<Check className="w-4 h-4" />}>
                    Simpan Data UMKM
                  </SoftButton>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
