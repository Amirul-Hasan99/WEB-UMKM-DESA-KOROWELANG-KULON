'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Check, Camera } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { UserAdmin } from '@/lib/types';

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('umkm_user');
      if (userStr) {
        try {
          const u: UserAdmin = JSON.parse(userStr);
          setUser(u);
          setName(u.name || '');
          setPhone(u.phone || '');
          setBio(u.bio || '');
          setAvatar(u.avatar || '');
        } catch (e) {}
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: UserAdmin = {
      ...user,
      name,
      phone,
      bio,
      avatar,
    };

    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('umkm_user', JSON.stringify(updatedUser));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Akun Saya</h1>
          <p className="text-xs text-gray-500">Perbarui informasi profil, nomor kontak, foto profil, dan biodata admin.</p>
        </div>

        <SoftCard className="p-6 md:p-8 max-w-2xl">
          {savedSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profil Anda berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Avatar Preview */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full soft-card p-1 overflow-hidden shrink-0">
                <img
                  src={avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs font-bold text-gray-400 uppercase">Role Akun</span>
                <span className="text-sm font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {user?.role === 'superadmin' ? 'Super Admin Kelurahan' : 'Admin Staff'}
                </span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </div>

            <SoftInput
              label="Nama Lengkap"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <SoftInput
              label="Nomor Telepon / WhatsApp"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />

            <ImageUploadInput
              label="Foto Profil Avatar Admin"
              value={avatar}
              onChange={setAvatar}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 ml-1">Biodata / Jabatan Staff</label>
              <textarea
                rows={3}
                className="soft-input w-full p-3 text-sm rounded-2xl"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tuliskan posisi atau deskripsi singkat tugas..."
              />
            </div>

            <SoftButton type="submit" variant="primary" size="lg" className="w-full" icon={<Check className="w-5 h-5" />}>
              Simpan Perubahan Profil
            </SoftButton>
          </form>
        </SoftCard>

      </main>
    </div>
  );
}
