'use client';

import React, { useEffect, useState } from 'react';
import { Store, Plus, Edit2, Trash2, X, Check, MapPin, Package, ShoppingBag, ArrowLeft } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { fetchUmkms } from '@/lib/api';
import { UMKM, UMKMProduct } from '@/lib/types';

export default function AdminUmkmPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  
  // UMKM Modal Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUmkm, setEditingUmkm] = useState<UMKM | null>(null);

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState('Kuliner');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gmapsUrl, setGmapsUrl] = useState('');
  const [gmapsEmbed, setGmapsEmbed] = useState('');
  const [description, setDescription] = useState('');
  const [landingText, setLandingText] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Product Management Modal states (Integrated in UMKM)
  const [selectedUmkmForProducts, setSelectedUmkmForProducts] = useState<UMKM | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UMKMProduct | null>(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pUnit, setPUnit] = useState('pcs');
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');

  useEffect(() => {
    fetchUmkms().then(setUmkms);
  }, []);

  // --- UMKM HANDLERS ---
  const openAddModal = () => {
    setEditingUmkm(null);
    setName('');
    setOwner('');
    setCategory('Kuliner');
    setAddress('');
    setPhone('');
    setWhatsapp('');
    setGmapsUrl('');
    setGmapsEmbed('');
    setDescription('');
    setLandingText('');
    setProfileImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (umkm: UMKM) => {
    setEditingUmkm(umkm);
    setName(umkm.name);
    setOwner(umkm.owner);
    setCategory(umkm.category);
    setAddress(umkm.address);
    setPhone(umkm.phone);
    setWhatsapp(umkm.whatsapp);
    setGmapsUrl(umkm.gmapsUrl);
    setGmapsEmbed(umkm.gmapsEmbed);
    setDescription(umkm.description);
    setLandingText(umkm.landingText);
    setProfileImage(umkm.profileImage);
    setIsModalOpen(true);
  };

  const handleSubmitUmkm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUmkm) {
      setUmkms(prev =>
        prev.map(u =>
          u.id === editingUmkm.id
            ? {
                ...u,
                name,
                owner,
                category,
                address,
                phone,
                whatsapp,
                gmapsUrl,
                gmapsEmbed,
                description,
                landingText,
                profileImage: profileImage || u.profileImage,
              }
            : u
        )
      );
    } else {
      const newUmkm: UMKM = {
        id: umkms.length > 0 ? Math.max(...umkms.map(u => u.id)) + 1 : 1,
        name,
        owner,
        category,
        address: address || 'Desa Korowelang Kulon',
        phone,
        whatsapp: whatsapp || phone,
        gmapsUrl,
        gmapsEmbed,
        description,
        landingText,
        profileImage: profileImage || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        products: []
      };
      setUmkms(prev => [newUmkm, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUmkm = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus UMKM ini beserta seluruh produknya?')) {
      setUmkms(prev => prev.filter(u => u.id !== id));
    }
  };

  // --- PRODUCT HANDLERS (INTEGRATED) ---
  const openProductModal = (umkm: UMKM) => {
    setSelectedUmkmForProducts(umkm);
    setIsProductFormOpen(false);
    setIsProductModalOpen(true);
  };

  const openAddProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setPUnit('pcs');
    setPDescription('');
    setPImage('');
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (prod: UMKMProduct) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(prod.price.toString());
    setPUnit(prod.unit);
    setPDescription(prod.description);
    setPImage(prod.image);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUmkmForProducts) return;

    let updatedProducts: UMKMProduct[] = [];
    if (editingProduct) {
      updatedProducts = (selectedUmkmForProducts.products || []).map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: pName,
              price: parseFloat(pPrice) || 0,
              unit: pUnit,
              description: pDescription,
              image: pImage || p.image,
            }
          : p
      );
    } else {
      const newProd: UMKMProduct = {
        id: Date.now(),
        umkmId: selectedUmkmForProducts.id,
        name: pName,
        price: parseFloat(pPrice) || 0,
        unit: pUnit,
        description: pDescription,
        image: pImage || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
      };
      updatedProducts = [newProd, ...(selectedUmkmForProducts.products || [])];
    }

    const updatedUmkm = { ...selectedUmkmForProducts, products: updatedProducts };
    setSelectedUmkmForProducts(updatedUmkm);
    setUmkms(prev => prev.map(u => (u.id === updatedUmkm.id ? updatedUmkm : u)));
    setIsProductFormOpen(false);
  };

  const handleDeleteProduct = (productId: number) => {
    if (!selectedUmkmForProducts) return;
    if (confirm('Hapus produk ini dari UMKM?')) {
      const updatedProducts = (selectedUmkmForProducts.products || []).filter(p => p.id !== productId);
      const updatedUmkm = { ...selectedUmkmForProducts, products: updatedProducts };
      setSelectedUmkmForProducts(updatedUmkm);
      setUmkms(prev => prev.map(u => (u.id === updatedUmkm.id ? updatedUmkm : u)));
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelola Data & Produk UMKM</h1>
            <p className="text-xs text-gray-500">Kelola pendaftaran usaha warga dan tambah/edit katalog produk langsung di masing-masing UMKM.</p>
          </div>
          <SoftButton variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Daftarkan UMKM Baru
          </SoftButton>
        </div>

        {/* UMKM Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {umkms.map((umkm) => (
            <SoftCard key={umkm.id} className="flex flex-col justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
                  <img src={umkm.profileImage} alt={umkm.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{umkm.category}</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {umkm.products?.length || 0} Produk
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900 truncate">{umkm.name}</h3>
                  <p className="text-xs text-gray-600">Pemilik: {umkm.owner}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    {umkm.address}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Includes Direct Product Management */}
              <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2">
                <SoftButton
                  variant="primary"
                  size="sm"
                  onClick={() => openProductModal(umkm)}
                  icon={<Package className="w-3.5 h-3.5" />}
                >
                  Kelola Produk ({umkm.products?.length || 0})
                </SoftButton>

                <div className="flex items-center gap-2">
                  <SoftButton variant="default" size="sm" onClick={() => openEditModal(umkm)} icon={<Edit2 className="w-3.5 h-3.5" />}>
                    Edit UMKM
                  </SoftButton>
                  <SoftButton variant="danger" size="sm" onClick={() => handleDeleteUmkm(umkm.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                    Hapus
                  </SoftButton>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>

        {/* MODAL 1: FORM ADD / EDIT DATA UMKM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto soft-card p-6 md:p-8 bg-[#eef2f6]">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingUmkm ? 'Edit Data UMKM' : 'Pendaftaran UMKM Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitUmkm} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput label="Nama UMKM" value={name} onChange={e => setName(e.target.value)} required />
                  <SoftInput label="Nama Pemilik" value={owner} onChange={e => setOwner(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Kategori</label>
                    <select
                      className="soft-input w-full p-3 text-sm rounded-2xl"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Kuliner">Kuliner</option>
                      <option value="Makanan Ringan">Makanan Ringan</option>
                      <option value="Kerajinan & Fashion">Kerajinan & Fashion</option>
                      <option value="Jasa">Jasa</option>
                    </select>
                  </div>

                  <SoftInput label="Nomor WhatsApp (Contoh: 628123456789)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
                </div>

                <SoftInput label="Alamat Lengkap" value={address} onChange={e => setAddress(e.target.value)} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput label="URL Google Maps" value={gmapsUrl} onChange={e => setGmapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." />
                  <SoftInput label="Embed Iframe Google Maps" value={gmapsEmbed} onChange={e => setGmapsEmbed(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                </div>

                <ImageUploadInput label="Foto Profil / Logo UMKM" value={profileImage} onChange={setProfileImage} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Ringkasan Teks Landing Page</label>
                  <textarea
                    rows={2}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={landingText}
                    onChange={e => setLandingText(e.target.value)}
                    placeholder="Kalimat promosi singkat di card landing page..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Deskripsi Lengkap Usaha</label>
                  <textarea
                    rows={4}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Penjelasan detail sejarah, bahan baku, keunggulan..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <SoftButton type="button" variant="default" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </SoftButton>
                  <SoftButton type="submit" variant="primary" icon={<Check className="w-4 h-4" />}>
                    Simpan Data UMKM
                  </SoftButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: INTEGRATED KELOLA PRODUK UNTUK UMKM SPESIFIK */}
        {isProductModalOpen && selectedUmkmForProducts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto soft-card p-6 md:p-8 bg-[#eef2f6] flex flex-col gap-6">
              
              {/* Header Modal Produk */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900">
                      Kelola Produk: {selectedUmkmForProducts.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      Pemilik: {selectedUmkmForProducts.owner} • Kategori: {selectedUmkmForProducts.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isProductFormOpen && (
                    <SoftButton variant="primary" size="sm" onClick={openAddProductForm} icon={<Plus className="w-4 h-4" />}>
                      Tambah Produk Baru
                    </SoftButton>
                  )}
                  <button onClick={() => setIsProductModalOpen(false)} className="p-2 rounded-xl soft-button text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SECTION: FORM TAMBAH / EDIT PRODUK */}
              {isProductFormOpen ? (
                <form onSubmit={handleSaveProduct} className="p-5 rounded-2xl soft-card-inset flex flex-col gap-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-300/60">
                    <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
                      {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                    </span>
                    <button type="button" onClick={() => setIsProductFormOpen(false)} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" /> Kembalikan ke Daftar Produk
                    </button>
                  </div>

                  <SoftInput label="Nama Produk" value={pName} onChange={e => setPName(e.target.value)} required />

                  <div className="grid grid-cols-2 gap-4">
                    <SoftInput label="Harga (Rp)" type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} required />
                    <SoftInput label="Satuan (pcs/pack/kg/ekor)" value={pUnit} onChange={e => setPUnit(e.target.value)} required />
                  </div>

                  <ImageUploadInput label="Foto Produk" value={pImage} onChange={setPImage} />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Deskripsi Produk</label>
                    <textarea
                      rows={3}
                      className="soft-input w-full p-3 text-sm rounded-2xl"
                      value={pDescription}
                      onChange={e => setPDescription(e.target.value)}
                      placeholder="Keunggulan produk, varian rasa, ketahanan..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-300/60">
                    <SoftButton type="button" variant="default" onClick={() => setIsProductFormOpen(false)}>
                      Batal
                    </SoftButton>
                    <SoftButton type="submit" variant="primary" icon={<Check className="w-4 h-4" />}>
                      {editingProduct ? 'Simpan Perubahan Produk' : 'Tambah Produk Ini'}
                    </SoftButton>
                  </div>
                </form>
              ) : (
                /* SECTION: DAFTAR PRODUK DALAM CARD UMKM */
                <div className="flex flex-col gap-4">
                  {(selectedUmkmForProducts.products || []).length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs font-semibold rounded-2xl soft-card-inset">
                      Belum ada produk yang didaftarkan untuk UMKM ini. Klik tombol "+ Tambah Produk Baru" di atas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUmkmForProducts.products?.map((prod) => (
                        <div key={prod.id} className="p-4 rounded-2xl soft-card flex flex-col justify-between gap-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <h4 className="font-bold text-gray-900 text-xs truncate">{prod.name}</h4>
                              <span className="text-xs font-extrabold text-blue-600 mt-0.5">
                                Rp {prod.price.toLocaleString('id-ID')} / {prod.unit}
                              </span>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-2">
                            <SoftButton variant="default" size="sm" onClick={() => openEditProductForm(prod)} icon={<Edit2 className="w-3 h-3" />}>
                              Edit
                            </SoftButton>
                            <SoftButton variant="danger" size="sm" onClick={() => handleDeleteProduct(prod.id)} icon={<Trash2 className="w-3 h-3" />}>
                              Hapus
                            </SoftButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
