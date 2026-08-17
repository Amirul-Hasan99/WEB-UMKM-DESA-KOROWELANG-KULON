'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Check } from '@/components/Icons';
import { uploadImage } from '@/lib/api';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    const res = await uploadImage(file);

    if (res.success && res.url) {
      onChange(res.url);
    } else {
      setUploadError(res.error || 'Gagal mengupload gambar. Coba lagi.');
    }

    setUploading(false);
    // Reset input agar file yang sama bisa dipilih lagi
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    onChange('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl soft-button text-xs font-bold text-gray-700 hover:text-blue-600 hover:bg-white/80 transition-all border border-dashed border-gray-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>{uploading ? 'Mengupload gambar...' : 'Pilih File Foto dari Perangkat (Device)'}</span>
        </button>
      </div>

      {/* Error message */}
      {uploadError && (
        <p className="text-xs text-red-500 font-semibold ml-1">{uploadError}</p>
      )}

      {/* Image Preview Thumbnail — hanya tampil jika sudah ada URL dari server */}
      {value && !value.startsWith('data:') && (
        <div className="mt-1 flex items-center justify-between p-2.5 rounded-2xl soft-card-sm bg-white/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
              <img src={value} alt="Preview Foto" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Foto Terpilih dari Perangkat
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                File Gambar Siap Digunakan
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            title="Hapus Foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadInput;
