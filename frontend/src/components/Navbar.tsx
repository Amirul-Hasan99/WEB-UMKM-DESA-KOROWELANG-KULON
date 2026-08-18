'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Info, MessageSquare, LogIn, Menu, X, ShieldCheck, Home } from '@/components/Icons';
import SoftButton from './SoftButton';
import { fetchDynamicContent } from '@/lib/api';
import { DynamicContent } from '@/lib/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState<DynamicContent | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchDynamicContent().then(setContent);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('umkm_token');
      const userStr = localStorage.getItem('umkm_user');
      if (token && userStr) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
        } catch (e) {}
      }
    }
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Daftar UMKM', href: '/umkm', icon: <Store className="w-4 h-4" /> },
    { name: 'Tentang Desa', href: '/tentang', icon: <Info className="w-4 h-4" /> },
    { name: 'Feedback', href: '/feedback', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-[#eef2f6]/90 backdrop-blur-md border-b border-white/60 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name (Clicks to Admin Portal / Login) */}
        <Link
          href={isLoggedIn ? (userRole === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard') : '/login'}
          className="flex items-center gap-3 group"
          title="Portal Admin"
        >
          <div className="w-11 h-11 rounded-2xl soft-card flex items-center justify-center p-1.5 overflow-hidden group-hover:scale-105 transition-transform">
            {content?.logoUrl ? (
              <img src={content.logoUrl} alt="Logo Desa" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-gray-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              {content?.siteName || 'UMKM Korowelang Kulon'}
            </span>
            <span className="text-[11px] font-semibold text-gray-500 tracking-wide mt-1">
              Desa Korowelang Kulon • Kendal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-3xl soft-card-inset">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl transition-all ${
                  isActive
                    ? 'soft-button-primary'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/40'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-2xl soft-button text-gray-700"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-3xl soft-card flex flex-col gap-3 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl ${
                pathname === link.href ? 'soft-button-primary' : 'text-gray-700 soft-card-sm'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
