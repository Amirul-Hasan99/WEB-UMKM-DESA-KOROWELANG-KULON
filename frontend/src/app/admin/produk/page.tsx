'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProdukRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect seamlessly to the integrated UMKM & Product management page
    router.replace('/admin/umkm');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center p-4">
      <div className="p-6 rounded-2xl soft-card text-center text-sm font-bold text-gray-600">
        Mengalihkan ke Halaman Kelola Data & Produk UMKM...
      </div>
    </div>
  );
}
