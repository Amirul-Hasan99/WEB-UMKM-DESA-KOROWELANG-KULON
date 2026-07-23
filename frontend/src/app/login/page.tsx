'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Store, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { loginAdmin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Silakan masukkan email dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Login gagal. Email atau password salah.');
    }
  };

  // Preset demo account fillers
  const fillCredentials = (type: 'superadmin' | 'admin') => {
    if (type === 'superadmin') {
      setEmail('superadmin@korowelangkulon.desa.id');
      setPassword('superadmin123');
    } else {
      setEmail('admin@korowelangkulon.desa.id');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#eef2f6]">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="w-14 h-14 rounded-2xl soft-card flex items-center justify-center p-2 mb-1 hover:scale-105 transition-transform">
            <Store className="w-8 h-8 text-blue-600" />
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Portal Admin Kelurahan
          </h1>
          <p className="text-xs text-gray-500 font-semibold">
            UMKM Desa Korowelang Kulon • Kabupaten Kendal
          </p>
        </div>

        {/* Soft UI Neumorphic Card (Matching design aesthetic) */}
        <SoftCard className="p-8 flex flex-col gap-6">
          
          <div className="flex flex-col gap-1 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-gray-500">Gunakan email & password terdaftar staff desa.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <SoftInput
              label="Email Staff / Admin"
              type="email"
              placeholder="username@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <SoftInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <SoftButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-1"
              disabled={loading}
              icon={<LogIn className="w-5 h-5" />}
            >
              {loading ? 'Memproses Login...' : 'Masuk (Sign In)'}
            </SoftButton>
          </form>

          {/* Quick Demo Testing Helpers */}
          <div className="pt-4 border-t border-gray-200 flex flex-col gap-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-center">
              Akses Cepat Pengujian Demo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin')}
                className="soft-button py-2 px-3 text-[11px] font-bold text-gray-700 hover:text-blue-600 flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="soft-button py-2 px-3 text-[11px] font-bold text-gray-700 hover:text-blue-600 flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Admin Staff
              </button>
            </div>
          </div>

        </SoftCard>

        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">
            ← Kembali ke Halaman Utama (Public)
          </Link>
        </div>

      </div>
    </div>
  );
}
