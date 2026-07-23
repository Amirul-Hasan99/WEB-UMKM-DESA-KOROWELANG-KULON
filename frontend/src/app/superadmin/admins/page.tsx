'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, X, Check, ShieldCheck, Mail, Phone } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { UserAdmin } from '@/lib/types';

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<UserAdmin[]>([
    {
      id: 1,
      name: "Super Admin Kelurahan",
      email: "superadmin@korowelangkulon.desa.id",
      role: "superadmin",
      phone: "081234567890",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Kepala Seksi Pemberdayaan Ekonomi Masyarakat Kelurahan Korowelang Kulon."
    },
    {
      id: 2,
      name: "Budi Santoso (Admin Staff)",
      email: "admin@korowelangkulon.desa.id",
      role: "admin",
      phone: "081987654321",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bio: "Staff Pendamping UMKM Kelurahan Korowelang Kulon."
    },
    {
      id: 3,
      name: "Siti Rahma (Admin Staff)",
      email: "siti@korowelangkulon.desa.id",
      role: "admin",
      phone: "085712345678",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      bio: "Staff Administrasi & Publikasi UMKM Desa."
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserAdmin | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const openAddModal = () => {
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('admin');
    setPhone('');
    setBio('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: UserAdmin) => {
    setEditingAdmin(a);
    setName(a.name);
    setEmail(a.email);
    setPassword('');
    setRole(a.role);
    setPhone(a.phone || '');
    setBio(a.bio || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      setAdmins(prev =>
        prev.map(a =>
          a.id === editingAdmin.id
            ? {
                ...a,
                name,
                email,
                role,
                phone,
                bio,
              }
            : a
        )
      );
    } else {
      const newAdmin: UserAdmin = {
        id: Date.now(),
        name,
        email,
        role,
        phone,
        bio: bio || 'Staff Kelurahan Korowelang Kulon.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };
      setAdmins(prev => [...prev, newAdmin]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun staff admin ini?')) {
      setAdmins(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelola Akun Admin Staff</h1>
            <p className="text-xs text-gray-500">Tambah, ubah perizinan role, atau hapus akun staff kelurahan.</p>
          </div>
          <SoftButton variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Tambah Akun Admin Baru
          </SoftButton>
        </div>

        {/* Admins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {admins.map((a) => (
            <SoftCard key={a.id} className="flex flex-col justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                  {a.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-gray-900 truncate">{a.name}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      a.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {a.role}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    {a.email}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    {a.phone || '-'}
                  </span>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{a.bio}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/80 flex items-center justify-end gap-2">
                <SoftButton variant="default" size="sm" onClick={() => openEditModal(a)} icon={<Edit2 className="w-3.5 h-3.5" />}>
                  Edit Akun
                </SoftButton>
                {a.role !== 'superadmin' && (
                  <SoftButton variant="danger" size="sm" onClick={() => handleDelete(a.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                    Hapus
                  </SoftButton>
                )}
              </div>
            </SoftCard>
          ))}
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg soft-card p-6 md:p-8 bg-[#eef2f6]">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingAdmin ? 'Edit Akun Admin' : 'Tambah Akun Admin Staff'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <SoftInput label="Nama Lengkap Staff" value={name} onChange={e => setName(e.target.value)} required />

                <SoftInput label="Email Login" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                <SoftInput label="Password Login" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editingAdmin ? 'Kosongkan jika tidak ingin diubah' : '••••••••'} required={!editingAdmin} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Hak Akses Role</label>
                  <select
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={role}
                    onChange={e => setRole(e.target.value as 'admin' | 'superadmin')}
                  >
                    <option value="admin">Admin Staff (Kelola UMKM & Produk)</option>
                    <option value="superadmin">Super Admin (Akses Penuh Kelurahan)</option>
                  </select>
                </div>

                <SoftInput label="Nomor Telepon / WA" value={phone} onChange={e => setPhone(e.target.value)} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Biodata / Tugas Staff</label>
                  <textarea
                    rows={3}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Staff pendamping UMKM / pengelola portal..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <SoftButton type="button" variant="default" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </SoftButton>
                  <SoftButton type="submit" variant="primary" icon={<Check className="w-4 h-4" />}>
                    Simpan Akun Admin
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
