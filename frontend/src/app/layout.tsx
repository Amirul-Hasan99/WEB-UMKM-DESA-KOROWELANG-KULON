import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UMKM Desa Korowelang Kulon | Portal Resmi Usaha Desa',
  description: 'Portal pemberdayaan dan katalog produk UMKM Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal.',
  keywords: ['UMKM', 'Korowelang Kulon', 'Kendal', 'Bandeng Presto', 'Batik Pesisir', 'Emping Melinjo', 'Desa Pesisir'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#eef2f6] text-gray-800 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
