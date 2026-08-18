'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle, Clock } from '@/components/Icons';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { loginAdmin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check if redirected here because session expired
    if (searchParams.get('expired') === '1') {
      setIsExpired(true);
    }

    // If already logged in (valid token in localStorage), redirect away
    if (typeof window !== 'undefined') {
      const existingToken = localStorage.getItem('umkm_token');
      const existingUser = localStorage.getItem('umkm_user');
      if (existingToken && existingUser) {
        try {
          const user = JSON.parse(existingUser);
          if (user.role === 'superadmin') {
            router.replace('/superadmin/dashboard');
          } else {
            router.replace('/admin/dashboard');
          }
        } catch {
          // Invalid stored user — clear and stay on login
          localStorage.removeItem('umkm_token');
          localStorage.removeItem('umkm_user');
        }
      }
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg('Silakan masukkan email dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setIsExpired(false);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success && res.user) {
      // loginAdmin sudah menyimpan token ke localStorage DAN cookie
      // Langsung redirect sesuai role
      if (res.user.role === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Login gagal. Periksa email & password Anda.');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-[#eef2f6] overflow-hidden">
      <div className="w-full max-w-sm flex flex-col gap-3 sm:gap-4 my-auto">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl soft-card flex items-center justify-center p-1.5 hover:scale-105 transition-transform overflow-hidden"
          >
            <img src="/logo-kendal.png" alt="Logo Kendal" className="w-full h-full object-cover rounded-xl" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
              Portal Admin Kelurahan
            </h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">
              Desa Kutoharjo • Kabupaten Kendal
            </p>
          </div>
        </div>

        {/* Soft UI Card */}
        <SoftCard className="p-5 sm:p-6 flex flex-col gap-4">

          <div className="flex flex-col gap-0.5 border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              Masuk Akun Staff / Admin
            </h2>
            <p className="text-[11px] text-gray-500">Masukkan kredensial login staff kelurahan.</p>
          </div>

          {/* Session expired notice */}
          {isExpired && (
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Sesi Anda telah berakhir. Silakan login kembali.</span>
            </div>
          )}

          {/* Error message */}
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
              placeholder="admin@kutoharjo.desa.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <SoftInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
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
        </SoftCard>

        <div className="text-center">
          <Link href="/" className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors">
            ← Kembali ke Halaman Utama (Public)
          </Link>
        </div>
      </div>
    </div>
  );
}
