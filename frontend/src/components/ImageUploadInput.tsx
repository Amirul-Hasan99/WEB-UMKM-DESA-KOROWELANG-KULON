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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');

    // Coba upload ke server — jika gagal, LANJUTKAN saja tanpa foto
    try {
      const res = await uploadImage(file);
      if (res.success && res.url) {
        onChange(res.url);
        setUploadStatus('success');
      } else {
        // Upload gagal — kosongkan nilai, form tetap bisa submit
        setUploadStatus('failed');
      }
    } catch {
      setUploadStatus('failed');
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    onChange('');
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 ml-1">
        {label} <span className="text-gray-400 font-normal normal-case">(opsional)</span>
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
          <span>{uploading ? 'Mengupload...' : 'Pilih File Foto dari Perangkat (Device)'}</span>
        </button>
      </div>

      {/* Status info — tidak memblokir submit */}
      {uploadStatus === 'failed' && (
        <p className="text-[11px] text-amber-600 font-semibold ml-1">
          ⚠ Foto tidak berhasil diupload. Data tetap akan tersimpan tanpa foto.
        </p>
      )}

      {/* Preview jika berhasil upload */}
      {value && uploadStatus === 'success' && (
        <div className="mt-1 flex items-center justify-between p-2.5 rounded-2xl soft-card-sm bg-white/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
              <img src={value} alt="Preview Foto" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Foto berhasil diupload
            </span>
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
