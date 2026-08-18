'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Package,
  UserCheck,
  Globe,
  User,
  MessageSquare,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from '@/components/Icons';
import SoftButton from './SoftButton';
import { UserAdmin } from '@/lib/types';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const syncUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('umkm_user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    syncUser();
    if (typeof window !== 'undefined') {
      window.addEventListener('umkm_user_updated', syncUser);
      return () => window.removeEventListener('umkm_user_updated', syncUser);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('umkm_token');
      localStorage.removeItem('umkm_user');
      document.cookie = 'umkm_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      document.cookie = 'umkm_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
    router.push('/login');
  };

  const isSuperAdmin = user?.role === 'superadmin';

  const menuItems = isSuperAdmin
    ? [
        {
          title: 'DASHBOARD SUPER ADMIN',
          items: [
            {
              name: 'Overview Utama',
              href: '/superadmin/dashboard',
              icon: <LayoutDashboard className="w-4 h-4" />
            }
          ]
        },
        {
          title: 'MANAJEMEN KELURAHAN',
          items: [
            { name: 'Kelola Akun Admin Staff', href: '/superadmin/admins', icon: <UserCheck className="w-4 h-4" /> },
            { name: 'Kelola Konten Website', href: '/superadmin/konten', icon: <Globe className="w-4 h-4" /> },
          ]
        },
        {
          title: 'AKUN & FEEDBACK',
          items: [
            { name: 'Profil Saya', href: '/admin/profil', icon: <User className="w-4 h-4" /> },
            { name: 'Lihat Feedback User', href: '/admin/feedback', icon: <MessageSquare className="w-4 h-4" /> },
          ]
        }
      ]
    : [
        {
          title: 'DASHBOARD ADMIN',
          items: [
            {
              name: 'Overview Utama',
              href: '/admin/dashboard',
              icon: <LayoutDashboard className="w-4 h-4" />
            }
          ]
        },
        {
          title: 'MANAJEMEN UMKM',
          items: [
            { name: 'Kelola Data & Produk UMKM', href: '/admin/umkm', icon: <Store className="w-4 h-4" /> },
          ]
        },
        {
          title: 'AKUN & FEEDBACK',
          items: [
            { name: 'Profil Saya', href: '/admin/profil', icon: <User className="w-4 h-4" /> },
            { name: 'Lihat Feedback User', href: '/admin/feedback', icon: <MessageSquare className="w-4 h-4" /> },
          ]
        }
      ];

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4 p-4 md:p-5 soft-card transition-all">
      
      {/* Top Header Row (User info & Mobile Toggle) */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl soft-card-inset">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base md:text-lg shadow-md shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              'A'
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs md:text-sm text-gray-800 truncate">
              {user?.name || 'Staff Desa'}
            </span>
            <span className="text-[10px] md:text-[11px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {isSuperAdmin ? 'Super Admin' : 'Admin Staff'}
            </span>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl soft-button text-xs font-bold text-gray-700 active:scale-95 shrink-0"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-4 h-4 text-blue-600" /> : <Menu className="w-4 h-4 text-gray-700" />}
          <span className="text-[11px]">{mobileOpen ? 'Tutup' : 'Menu'}</span>
        </button>
      </div>

      {/* Navigation Sections & Logout (Collapsible on mobile, permanent on desktop) */}
      <div className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col gap-6 pt-2 md:pt-0 animate-in fade-in slide-in-from-top-2 md:animate-none`}>
        <div className="flex flex-col gap-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-2">
                {section.title}
              </span>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all ${
                        isActive
                          ? 'soft-button-primary'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-gray-200">
          <SoftButton
            variant="danger"
            size="sm"
            className="w-full text-xs"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
          >
            Keluar (Logout)
          </SoftButton>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
