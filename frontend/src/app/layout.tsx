import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://umkm-desa-korowelang-kulon.vercel.app'),
  title: {
    default: 'UMKM Desa Korowelang Kulon | Portal Resmi Usaha Desa',
    template: '%s | UMKM Korowelang Kulon',
  },
  description: 'Portal pemberdayaan digital dan katalog produk resmi UMKM Desa Korowelang Kulon, Kecamatan Cepiring, Kabupaten Kendal, Jawa Tengah.',
  keywords: [
    'UMKM Korowelang Kulon',
    'Kuliner Korowelang Kulon',
    'Bandeng Presto Kendal',
    'Desa Korowelang Kulon',
    'Kendal',
    'Pemberdayaan Ekonomi Desa',
    'Katalog UMKM Kendal'
  ],
  authors: [{ name: 'Pemerintah Desa Korowelang Kulon' }],
  creator: 'Pemerintah Desa Korowelang Kulon',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://umkm-desa-korowelang-kulon.vercel.app',
    title: 'UMKM Desa Korowelang Kulon | Portal Resmi Usaha Desa',
    description: 'Jelajahi produk lokal berkualitas, kuliner unggulan, dan usaha masyarakat Desa Korowelang Kulon.',
    siteName: 'Portal UMKM Desa Korowelang Kulon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UMKM Desa Korowelang Kulon',
    description: 'Portal Resmi Produk & Usaha Desa Korowelang Kulon, Kendal.',
  },
  icons: {
    icon: [
      { url: '/logo-kendal.png', type: 'image/png' },
    ],
    shortcut: '/logo-kendal.png',
    apple: '/logo-kendal.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: 'Portal UMKM Desa Korowelang Kulon',
  url: 'https://umkm-desa-korowelang-kulon.vercel.app',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kendal',
    addressRegion: 'Jawa Tengah',
    addressCountry: 'ID',
  },
  description: 'Wadah digitalisasi resmi dan portal UMKM Desa Korowelang Kulon, Kendal, Jawa Tengah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" type="image/png" href="/logo-kendal.png" />
        <link rel="shortcut icon" type="image/png" href="/logo-kendal.png" />
        <link rel="apple-touch-icon" href="/logo-kendal.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#eef2f6] text-gray-800 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

