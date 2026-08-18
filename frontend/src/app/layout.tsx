import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://umkm-kutoharjo.vercel.app'),
  title: {
    default: 'UMKM Desa Kutoharjo | Portal Resmi Usaha Desa',
    template: '%s | UMKM Kutoharjo',
  },
  description: 'Portal pemberdayaan digital dan katalog produk resmi UMKM Desa Kutoharjo, Kecamatan Kaliwungu, Kabupaten Kendal, Jawa Tengah.',
  keywords: [
    'UMKM Kutoharjo',
    'Kuliner Kutoharjo',
    'Bandeng Cabut Duri',
    'Desa Kutoharjo',
    'Kendal',
    'Pemberdayaan Ekonomi Desa',
    'Katalog UMKM Kendal'
  ],
  authors: [{ name: 'Pemerintah Desa Kutoharjo' }],
  creator: 'Pemerintah Desa Kutoharjo',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://umkm-kutoharjo.vercel.app',
    title: 'UMKM Desa Kutoharjo | Portal Resmi Usaha Desa',
    description: 'Jelajahi produk lokal berkualitas, kuliner unggulan, dan usaha masyarakat Desa Kutoharjo.',
    siteName: 'Portal UMKM Desa Kutoharjo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UMKM Desa Kutoharjo',
    description: 'Portal Resmi Produk & Usaha Desa Kutoharjo, Kendal.',
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
  name: 'Portal UMKM Desa Kutoharjo',
  url: 'https://umkm-kutoharjo.vercel.app',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kendal',
    addressRegion: 'Jawa Tengah',
    addressCountry: 'ID',
  },
  description: 'Wadah digitalisasi resmi dan portal UMKM Desa Kutoharjo, Kendal, Jawa Tengah.',
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
      <body className="bg-[#eef2f6] text-gray-800 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

