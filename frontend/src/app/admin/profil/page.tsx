'use client';

import React, { useEffect, useState } from 'react';
import { User, Phone, ShieldCheck, Check, AlertCircle, Info } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { UserAdmin } from '@/lib/types';
import { fetchUserProfile, updateUserProfile } from '@/lib/api';

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load fresh data directly from Database
    const loadProfile = async () => {
      setLoading(true);
      const res = await fetchUserProfile();
      if (res.success && res.data) {
        setUser(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setBio(res.data.bio || '');
        setAvatar(res.data.avatar || '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('umkm_user', JSON.stringify(res.data));
        }
      } else {
        // Fallback from localStorage if offline
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
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setErrorMsg('');
    setSavedSuccess(false);

    // Password intentionally excluded — only superadmin can change passwords
    const payload: Partial<UserAdmin> = {
      name,
      phone,
      bio,
      avatar,
    };

    const res = await updateUserProfile(payload);
    setSubmitting(false);

    if (res.success && res.data) {
      setUser(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('umkm_user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('umkm_user_updated'));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan perubahan profil ke server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Akun Saya</h1>
          <p className="text-xs text-gray-500">Perbarui informasi profil, nomor kontak, foto profil, dan biodata admin di database.</p>
        </div>

        {/* Info banner: password only changed by superadmin */}
        <div className="p-4 rounded-2xl bg-blue-50 text-blue-700 text-xs border border-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <span>
            <strong>Informasi:</strong> Perubahan <strong>password login</strong> hanya dapat dilakukan oleh{' '}
            <strong>Super Admin Desa</strong> melalui halaman &ldquo;Kelola Akun Admin&rdquo;.
            Hubungi superadmin jika Anda perlu mengganti password.
          </span>
        </div>

        <SoftCard className="p-6 md:p-8 max-w-2xl">
          {savedSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profil Anda berhasil diperbarui dan tersimpan di database!</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-20 bg-gray-200/70 rounded-2xl" />
              <div className="h-12 bg-gray-200/70 rounded-2xl" />
              <div className="h-12 bg-gray-200/70 rounded-2xl" />
            </div>
          ) : (
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
                    {user?.role === 'superadmin' ? 'Super Admin Desa' : 'Admin Staff'}
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
                label="Foto Profil Avatar Admin (opsional)"
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

              <SoftButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={submitting}
                icon={<Check className="w-5 h-5" />}
              >
                {submitting ? 'Menyimpan ke Database...' : 'Simpan Perubahan Profil'}
              </SoftButton>
            </form>
          )}
        </SoftCard>

      </main>
    </div>
  );
}

