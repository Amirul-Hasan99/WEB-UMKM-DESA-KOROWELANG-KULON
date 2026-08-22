'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, X, Check, ShieldCheck, Mail, Phone, Lock, AlertCircle, RotateCw } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { UserAdmin } from '@/lib/types';
import {
  fetchAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
} from '@/lib/api';

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserAdmin | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Get current logged-in user id to prevent self-delete
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('umkm_user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setCurrentUserId(u.id);
        } catch {}
      }
    }
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await fetchAdminAccounts();
    if (res.success && res.data) {
      setAdmins(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal memuat daftar akun admin.');
    }
    setLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('admin');
    setPhone('');
    setBio('');
    setModalError('');
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
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    if (editingAdmin) {
      // Update existing admin
      const payload: { name?: string; email?: string; password?: string; role?: 'admin' | 'superadmin'; phone?: string; bio?: string } = {
        name, email, role, phone, bio
      };
      // Only send password if filled
      if (password.trim().length > 0) {
        if (password.trim().length < 6) {
          setModalError('Password baru minimal 6 karakter.');
          setSubmitting(false);
          return;
        }
        payload.password = password.trim();
      }

      const res = await updateAdminAccount(editingAdmin.id, payload);
      if (res.success && res.data) {
        setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? { ...a, ...res.data! } : a));
        setIsModalOpen(false);
        showSuccess(`Akun ${name} berhasil diperbarui.`);
      } else {
        setModalError(res.error || 'Gagal memperbarui akun admin.');
      }
    } else {
      // Create new admin
      if (!password.trim() || password.trim().length < 6) {
        setModalError('Password wajib diisi minimal 6 karakter.');
        setSubmitting(false);
        return;
      }

      const res = await createAdminAccount({ name, email, password: password.trim(), role, phone, bio });
      if (res.success && res.data) {
        setAdmins(prev => [...prev, res.data!]);
        setIsModalOpen(false);
        showSuccess(`Akun ${name} berhasil dibuat.`);
      } else {
        setModalError(res.error || 'Gagal membuat akun admin baru.');
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (admin: UserAdmin) => {
    if (admin.id === currentUserId) {
      alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang login.');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${admin.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    const res = await deleteAdminAccount(admin.id);
    if (res.success) {
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
      showSuccess(`Akun ${admin.name} berhasil dihapus.`);
    } else {
      setErrorMsg(res.error || 'Gagal menghapus akun admin.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelola Akun Admin Staff</h1>
            <p className="text-xs text-gray-500">Tambah, ubah perizinan role, ubah password, atau hapus akun staff desa.</p>
          </div>
          <div className="flex items-center gap-2">
            <SoftButton variant="default" size="sm" onClick={loadAdmins} icon={<RotateCw className="w-4 h-4" />}>
              Refresh
            </SoftButton>
            <SoftButton variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
              Tambah Akun Admin Baru
            </SoftButton>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="soft-card p-6 animate-pulse flex flex-col gap-4">
                <div className="h-14 bg-gray-200/70 rounded-2xl" />
                <div className="h-4 bg-gray-200/70 rounded-xl w-3/4" />
                <div className="h-4 bg-gray-200/70 rounded-xl w-1/2" />
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <SoftCard className="p-12 flex flex-col items-center gap-3 text-center">
            <UserCheck className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 font-semibold text-sm">Belum ada akun admin yang terdaftar.</p>
            <SoftButton variant="primary" size="sm" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
              Tambah Akun Pertama
            </SoftButton>
          </SoftCard>
        ) : (
          /* Admins Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {admins.map((a) => (
              <SoftCard key={a.id} className="flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-base text-gray-900 truncate">{a.name}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        a.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {a.role === 'superadmin' ? 'Super Admin' : 'Admin Staff'}
                      </span>
                      {a.id === currentUserId && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700">Anda</span>
                      )}
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
                    Edit & Reset Password
                  </SoftButton>
                  {a.id !== currentUserId && (
                    <SoftButton variant="danger" size="sm" onClick={() => handleDelete(a)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                      Hapus
                    </SoftButton>
                  )}
                </div>
              </SoftCard>
            ))}
          </div>
        )}

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg soft-card p-6 md:p-8 bg-[#eef2f6] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {editingAdmin ? `Edit Akun: ${editingAdmin.name}` : 'Tambah Akun Admin Staff'}
                  </h3>
                  {editingAdmin && (
                    <p className="text-xs text-gray-500 mt-0.5">Kosongkan password jika tidak ingin mengubahnya.</p>
                  )}
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <SoftInput label="Nama Lengkap Staff" value={name} onChange={e => setName(e.target.value)} required />

                <SoftInput label="Email Login" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                <SoftInput
                  label={editingAdmin ? 'Reset Password Baru (opsional)' : 'Password Login'}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder={editingAdmin ? 'Kosongkan jika tidak ingin diubah' : 'Min. 6 karakter'}
                  required={!editingAdmin}
                />

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
                  <SoftButton type="submit" variant="primary" disabled={submitting} icon={<Check className="w-4 h-4" />}>
                    {submitting ? 'Menyimpan...' : editingAdmin ? 'Simpan Perubahan' : 'Buat Akun Admin'}
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