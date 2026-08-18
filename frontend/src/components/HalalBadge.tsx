'use client';

import React from 'react';

/**
 * Official Indonesian Halal (BPJPH) Gunungan Emblem SVG
 */
export function HalalIndonesiaLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Halal Indonesia"
    >
      {/* Gunungan / Wayang Calligraphy Outline */}
      <path
        d="M60 5 C55 20, 30 45, 25 70 C22 85, 28 100, 35 110 C42 118, 52 122, 60 123 C68 122, 78 118, 85 110 C92 100, 98 85, 95 70 C90 45, 65 20, 60 5 Z"
        fill="#672982"
      />
      {/* Inner Arabic Calligraphy Silhouette */}
      <path
        d="M60 22 C61 35, 75 52, 78 72 C80 84, 76 96, 70 103 C65 108, 58 110, 52 108 C46 106, 42 98, 43 88 C44 76, 50 64, 53 50 C54 42, 57 30, 60 22 Z"
        fill="#FFFFFF"
      />
      <path
        d="M60 38 C56 50, 48 65, 48 78 C48 88, 53 96, 60 97 C67 96, 72 88, 72 78 C72 65, 64 50, 60 38 Z"
        fill="#672982"
      />
      {/* Indonesian Halal Wordmark */}
      <rect x="20" y="128" width="80" height="16" rx="4" fill="#672982" />
      <text
        x="60"
        y="140"
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        HALAL
      </text>
    </svg>
  );
}

/**
 * Modern floating badge for top-right of cards & photos
 */
export function HalalCornerBadge({
  size = 'md',
  showText = true,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px] gap-1',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  }[size];

  const logoSizes = {
    sm: 'w-3.5 h-4',
    md: 'w-4 h-5',
    lg: 'w-5 h-6',
  }[size];

  return (
    <div
      className={`inline-flex items-center bg-white/95 backdrop-blur-md text-[#672982] font-black rounded-xl shadow-lg border border-purple-100/80 ${sizeClasses} ${className}`}
      title="Bersertifikat Halal Resmi"
    >
      <HalalIndonesiaLogo className={`${logoSizes} shrink-0 text-[#672982]`} />
      {showText && (
        <span className="tracking-wider uppercase font-extrabold text-[#672982] leading-none">
          HALAL
        </span>
      )}
    </div>
  );
}

/**
 * Full certification badge with certificate number
 */
export function HalalVerifiedPill({
  halalNumber,
  className = '',
}: {
  halalNumber?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 shadow-sm ${className}`}
    >
      <div className="w-6 h-7 flex items-center justify-center shrink-0">
        <HalalIndonesiaLogo className="w-full h-full text-[#672982]" />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-[#672982] tracking-wider uppercase">
            HALAL INDONESIA
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-[#672982] rounded-md">
            RESMI
          </span>
        </div>
        {halalNumber ? (
          <span className="text-[10px] text-gray-500 font-semibold truncate">
            No. {halalNumber}
          </span>
        ) : (
          <span className="text-[10px] text-gray-500 font-medium">
            Tersertifikasi BPJPH / MUI
          </span>
        )}
      </div>
    </div>
  );
}
