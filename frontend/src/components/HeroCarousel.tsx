'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HeroMediaItem } from '@/lib/types';
import { ChevronLeft, ChevronRight, Play, Pause, Video, Image as ImageIcon } from '@/components/Icons';

interface HeroCarouselProps {
  mediaList?: HeroMediaItem[];
  fallbackImageUrl?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

export default function HeroCarousel({
  mediaList = [],
  fallbackImageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  defaultTitle = 'Produk Olahan & Kerajinan Tangan',
  defaultSubtitle = 'Mendorong kemandirian ekonomi masyarakat Korowelang Kulon.',
}: HeroCarouselProps) {
  // Normalize items to ensure there is always at least 1 item
  const items: HeroMediaItem[] =
    mediaList && mediaList.length > 0
      ? [...mediaList].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [
          {
            id: 'fallback-1',
            type: 'image',
            url: fallbackImageUrl,
            title: defaultTitle,
            subtitle: defaultSubtitle,
            order: 1,
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Keep index in bounds if mediaList changes
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || isHovered || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, items.length, currentIndex]);

  // When active slide is a video, trigger play
  useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem?.type === 'video') {
      const vid = videoRefs.current[currentIndex];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }, [currentIndex, items]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const activeItem = items[currentIndex] || items[0];

  return (
    <div
      className="relative w-full max-w-md mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="soft-card p-4 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300">
        
        {/* Main Media Showcase Container */}
        <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-4 bg-gray-900 shadow-inner group">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={item.id || idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {item.type === 'video' ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={item.url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || 'Banner Slide UMKM'}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Subtle Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                {/* Top Badge: Foto / Video Indicator */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="text-[11px] font-bold bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                    {item.type === 'video' ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-red-400" />
                        <span>Video Desa</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Galeri Foto</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Navigation Controls (Left / Right Arrows) - Show if more than 1 item */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide Sebelumnya"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide Selanjutnya"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Bottom Carousel Indicators / Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Pindah ke slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentIndex
                        ? 'w-5 h-2 bg-blue-500 shadow-sm'
                        : 'w-2 h-2 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Jeda Slider' : 'Putar Slider'}
                  className="ml-1 text-white/80 hover:text-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Caption Box */}
        <div className="p-2 flex flex-col gap-1">
          <h3 className="font-extrabold text-gray-800 text-base line-clamp-1 transition-all">
            {activeItem.title || defaultTitle}
          </h3>
          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed transition-all">
            {activeItem.subtitle || defaultSubtitle}
          </p>
        </div>

      </div>
    </div>
  );
}
