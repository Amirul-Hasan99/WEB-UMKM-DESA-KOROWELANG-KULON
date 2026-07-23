'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ShieldCheck, UserCheck, AlertCircle } from '@/components/Icons';
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
    <div className="h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-[#eef2f6] overflow-hidden">
      <div className="w-full max-w-sm flex flex-col gap-3 sm:gap-4 my-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <Link href="/" className="w-12 h-12 rounded-2xl soft-card flex items-center justify-center p-1.5 hover:scale-105 transition-transform overflow-hidden">
            <img src="/api/logo" alt="Logo Kendal" className="w-full h-full object-cover rounded-xl" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
              Portal Admin Kelurahan
            </h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">
              Desa Korowelang Kulon • Kabupaten Kendal
            </p>
          </div>
        </div>

        {/* Soft UI Neumorphic Card */}
        <SoftCard className="p-5 sm:p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-0.5 border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Masuk Akun Staff / Admin
            </h2>
            <p className="text-[11px] text-gray-500">Masukkan kredensial login staff kelurahan.</p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
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
              size="sm"
              className="w-full mt-1 py-2.5"
              disabled={loading}
              icon={<LogIn className="w-4 h-4" />}
            >
              {loading ? 'Memproses Login...' : 'Masuk (Sign In)'}
            </SoftButton>
          </form>

          {/* Quick Demo Testing Helpers */}
          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 text-center">
              Akses Cepat Demo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin')}
                className="soft-button py-1.5 px-2 text-[11px] font-bold text-gray-700 hover:text-blue-600 flex items-center justify-center gap-1 rounded-xl"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="soft-button py-1.5 px-2 text-[11px] font-bold text-gray-700 hover:text-blue-600 flex items-center justify-center gap-1 rounded-xl"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Admin Staff
              </button>
            </div>
          </div>

        </SoftCard>

        <div className="text-center">
          <Link href="/" className="text-[11px] font-bold text-gray-500 hover:text-blue-600 transition-colors">
            ← Kembali ke Halaman Utama (Public)
          </Link>
        </div>

      </div>
    </div>
  );
}
