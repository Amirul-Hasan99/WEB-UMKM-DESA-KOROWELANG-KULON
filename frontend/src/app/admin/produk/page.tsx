'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, X, Check, Store } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { fetchUmkms } from '@/lib/api';
import { UMKM, UMKMProduct } from '@/lib/types';

export default function AdminProdukPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [selectedUmkmId, setSelectedUmkmId] = useState<number | null>(null);
  const [products, setProducts] = useState<UMKMProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UMKMProduct | null>(null);

  // Form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    fetchUmkms().then((data) => {
      setUmkms(data);
      if (data.length > 0) {
        setSelectedUmkmId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedUmkmId) {
      const selected = umkms.find(u => u.id === selectedUmkmId);
      setProducts(selected?.products || []);
    }
  }, [selectedUmkmId, umkms]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setUnit('pcs');
    setDescription('');
    setImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: UMKMProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setUnit(prod.unit);
    setDescription(prod.description);
    setImage(prod.image);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUmkmId) return;

    if (editingProduct) {
      const updated = products.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              name,
              price: parseFloat(price) || 0,
              unit,
              description,
              image: image || p.image,
            }
          : p
      );
      setProducts(updated);
      setUmkms(prev =>
        prev.map(u => (u.id === selectedUmkmId ? { ...u, products: updated } : u))
      );
    } else {
      const newProd: UMKMProduct = {
        id: Date.now(),
        umkmId: selectedUmkmId,
        name,
        price: parseFloat(price) || 0,
        unit,
        description,
        image: image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
      };
      const updated = [newProd, ...products];
      setProducts(updated);
      setUmkms(prev =>
        prev.map(u => (u.id === selectedUmkmId ? { ...u, products: updated } : u))
      );
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      setUmkms(prev =>
        prev.map(u => (u.id === selectedUmkmId ? { ...u, products: updated } : u))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelola Produk UMKM</h1>
            <p className="text-xs text-gray-500">Atur barang, varian, dan harga jual produk masing-masing UMKM.</p>
          </div>
          <SoftButton variant="primary" onClick={openAddModal} disabled={!selectedUmkmId} icon={<Plus className="w-4 h-4" />}>
            Tambah Produk Baru
          </SoftButton>
        </div>

        {/* UMKM Selector Dropdown */}
        <SoftCard className="p-4 flex items-center gap-4">
          <Store className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Pilih UMKM:</span>
          <select
            className="soft-input w-full p-2.5 text-sm font-bold text-gray-800 rounded-2xl"
            value={selectedUmkmId || ''}
            onChange={(e) => setSelectedUmkmId(Number(e.target.value))}
          >
            {umkms.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (Pemilik: {u.owner})
              </option>
            ))}
          </select>
        </SoftCard>

        {/* Product Cards */}
        {products.length === 0 ? (
          <SoftCard className="p-12 text-center text-gray-500 text-sm">
            Belum ada produk yang didaftarkan untuk UMKM ini. Klik tombol di atas untuk menambah produk.
          </SoftCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <SoftCard key={prod.id} className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-gray-200">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{prod.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{prod.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-blue-600">
                    Rp {prod.price.toLocaleString('id-ID')} / {prod.unit}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(prod)} className="p-2 rounded-xl soft-button text-gray-600 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2 rounded-xl soft-button text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        )}

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg soft-card p-6 md:p-8 bg-[#eef2f6]">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <SoftInput label="Nama Produk" value={name} onChange={e => setName(e.target.value)} required />

                <div className="grid grid-cols-2 gap-4">
                  <SoftInput label="Harga (Rp)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                  <SoftInput label="Satuan (pcs/pack/kg)" value={unit} onChange={e => setUnit(e.target.value)} required />
                </div>

                <ImageUploadInput label="Foto Produk UMKM" value={image} onChange={setImage} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Deskripsi Produk</label>
                  <textarea
                    rows={3}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Keunggulan produk, varian rasa, ketahanan..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <SoftButton type="button" variant="default" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </SoftButton>
                  <SoftButton type="submit" variant="primary" icon={<Check className="w-4 h-4" />}>
                    Simpan Produk
                  </SoftButton>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
