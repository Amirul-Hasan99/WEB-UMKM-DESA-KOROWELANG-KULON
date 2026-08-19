'use client';

import React, { useRef, useState } from 'react';
import { HeroMediaItem } from '@/lib/types';
import {
  Upload,
  Video,
  Image as ImageIcon,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  Film,
  Sparkles,
} from '@/components/Icons';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';
import { uploadMedia } from '@/lib/api';

interface HeroMediaManagerProps {
  mediaList: HeroMediaItem[];
  onChange: (mediaList: HeroMediaItem[]) => void;
}

export default function HeroMediaManager({
  mediaList = [],
  onChange,
}: HeroMediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Form states for new item
  const [addMode, setAddMode] = useState<'upload' | 'url'>('upload');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');

  // Reordering helpers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...mediaList];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    // Re-index order numbers
    const updated = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === mediaList.length - 1) return;
    const items = [...mediaList];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    // Re-index order numbers
    const updated = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = mediaList
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, order: idx + 1 }));
    onChange(filtered);
  };

  const handleUpdateItem = (
    id: string,
    field: 'title' | 'subtitle' | 'type' | 'url',
    val: string
  ) => {
    const updated = mediaList.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange(updated);
  };

  // Upload file from device (photo or video)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const res = await uploadMedia(file);
      if (res.success && res.url) {
        const isVideo = file.type.startsWith('video/') || res.mediaType === 'video';
        setNewUrl(res.url);
        setNewType(isVideo ? 'video' : 'image');
        setUploadSuccess(
          `Berhasil mengunggah ${isVideo ? 'video' : 'foto'}! Silakan klik tombol 'Tambahkan Slide ke Banner'.`
        );
      } else {
        setUploadError(res.error || 'Gagal mengunggah file media.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add new item to list
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newUrl.trim()) {
      setUploadError('Pilih file media atau masukkan URL media terlebih dahulu.');
      return;
    }

    const newItem: HeroMediaItem = {
      id: 'media-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: newType,
      url: newUrl.trim(),
      title: newTitle.trim() || undefined,
      subtitle: newSubtitle.trim() || undefined,
      order: mediaList.length + 1,
    };

    const updated = [...mediaList, newItem].map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    onChange(updated);

    // Reset form
    setNewUrl('');
    setNewTitle('');
    setNewSubtitle('');
    setUploadSuccess('');
    setUploadError('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Daftar Konten Slider Hero (Foto & Video Auto-Slide)
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Unggah foto/video dan atur urutan tayang slide carousel di landing page.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          {mediaList.length} Konten Aktif
        </span>
      </div>

      {/* List of existing slides */}
      <div className="flex flex-col gap-3">
        {mediaList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center gap-2">
            <Film className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-semibold text-gray-600">
              Belum ada slide foto atau video di hero banner.
            </p>
            <p className="text-xs text-gray-400">
              Gunakan formulir di bawah untuk menambahkan foto atau video baru.
            </p>
          </div>
        ) : (
          mediaList.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:border-blue-300"
            >
              {/* Left: Reorder Controls + Order Number */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Naikkan Urutan (Tampil Lebih Awal)"
                    className="p-1 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === mediaList.length - 1}
                    title="Turunkan Urutan (Tampil Lebih Akhir)"
                    className="p-1 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                  #{item.order || index + 1}
                </div>
              </div>

              {/* Middle: Media Preview */}
              <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-300 shrink-0 flex items-center justify-center">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || 'Slide Hero'}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Badge Type */}
                <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  {item.type === 'video' ? (
                    <>
                      <Video className="w-3 h-3 text-red-400" /> Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 text-blue-400" /> Foto
                    </>
                  )}
                </div>
              </div>

              {/* Middle: Title & Subtitle Inputs */}
              <div className="flex-1 flex flex-col gap-2 w-full min-w-0">
                <input
                  type="text"
                  placeholder="Judul Slide (opsional, contoh: Produk Olahan Khas)"
                  value={item.title || ''}
                  onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                  className="soft-input w-full p-2 text-xs rounded-xl font-bold text-gray-800"
                />
                <input
                  type="text"
                  placeholder="Keterangan singkat (opsional)"
                  value={item.subtitle || ''}
                  onChange={(e) => handleUpdateItem(item.id, 'subtitle', e.target.value)}
                  className="soft-input w-full p-2 text-xs rounded-xl text-gray-600"
                />
              </div>

              {/* Right: Delete Action */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  title="Hapus Slide Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD NEW SLIDE SECTION */}
      <div className="p-5 rounded-3xl bg-white/80 border border-blue-200/80 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold uppercase text-gray-800 tracking-wider">
            Tambah Konten Foto / Video Baru ke Hero Banner
          </h3>
        </div>

        {/* Mode Switch: Upload File vs URL */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddMode('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              addMode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Upload dari Device
          </button>
          <button
            type="button"
            onClick={() => setAddMode('url')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              addMode === 'url'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Masukkan URL Media
          </button>
        </div>

        {/* File Uploader */}
        {addMode === 'upload' ? (
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40 hover:bg-blue-50/80 text-blue-700 font-bold text-xs transition-all disabled:opacity-60"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>
                {uploading
                  ? 'Sedang mengunggah media (foto/video)...'
                  : 'Pilih File Foto atau Video (.mp4, .webm, .jpg, .png, .webp)'}
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-500">Tipe Media</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'image' | 'video')}
                className="soft-input w-full p-2.5 text-xs rounded-xl font-semibold text-gray-800"
              >
                <option value="image">Foto (Gambar)</option>
                <option value="video">Video (MP4 / WebM)</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-500">URL Media Langsung</label>
              <input
                type="url"
                placeholder="https://example.com/banner-video.mp4 atau link foto"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="soft-input w-full p-2.5 text-xs rounded-xl text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Feedback message */}
        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <p className="text-xs font-bold text-red-600 ml-1">⚠ {uploadError}</p>
        )}

        {/* Preview of uploaded/entered media if available */}
        {newUrl && (
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 h-20 rounded-xl overflow-hidden bg-black shrink-0 flex items-center justify-center border border-gray-300">
              {newType === 'video' ? (
                <video
                  src={newUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <img
                  src={newUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="Judul Slide (opsional, contoh: Profil UMKM Unggulan)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="soft-input w-full p-2 text-xs rounded-xl font-bold"
              />
              <input
                type="text"
                placeholder="Deskripsi Singkat (opsional)"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="soft-input w-full p-2 text-xs rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Add button */}
        <SoftButton
          type="button"
          variant="primary"
          size="sm"
          onClick={() => handleAddItem()}
          disabled={!newUrl.trim() || uploading}
          icon={<Plus className="w-4 h-4" />}
          className="w-full py-2.5"
        >
          Tambahkan Slide ke Banner
        </SoftButton>
      </div>
    </div>
  );
}
