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
  ChevronRight
} from '@/components/Icons';
import SoftButton from './SoftButton';
import { UserAdmin } from '@/lib/types';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserAdmin | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('umkm_user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('umkm_token');
      localStorage.removeItem('umkm_user');
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
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 p-5 soft-card">
      
      {/* User Info Badge */}
      <div className="flex items-center gap-3 p-3 rounded-2xl soft-card-inset">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
          {user?.name ? user.name.charAt(0) : 'A'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-gray-800 truncate">
            {user?.name || 'Staff Kelurahan'}
          </span>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {isSuperAdmin ? 'Super Admin' : 'Admin Staff'}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
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
      <div className="mt-auto pt-4 border-t border-gray-200">
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
    </aside>
  );
};

export default AdminSidebar;
