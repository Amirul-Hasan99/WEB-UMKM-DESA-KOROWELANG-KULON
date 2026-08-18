'use client';

import React, { useEffect, useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  MapPin,
  Package,
  ArrowLeft,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
} from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import ImageUploadInput from '@/components/ImageUploadInput';
import { HalalIndonesiaLogo, HalalCornerBadge, HalalVerifiedPill } from '@/components/HalalBadge';
import {
  fetchAdminUmkms,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  createProduct,
  updateProduct,
  deleteProduct,
  parseGmapsEmbedUrl,
} from '@/lib/api';
import { UMKM, UMKMProduct } from '@/lib/types';

export default function AdminUmkmPage() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);

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
  const [isHalal, setIsHalal] = useState(false);
  const [halalNumber, setHalalNumber] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);

  // Product Management Modal states
  const [selectedUmkmForProducts, setSelectedUmkmForProducts] = useState<UMKM | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UMKMProduct | null>(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pUnit, setPUnit] = useState('pcs');
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');
  const [pIsHalal, setPIsHalal] = useState(false);
  const [pHalalNumber, setPHalalNumber] = useState('');

  // ============================================================
  // Load Data — using ADMIN endpoint (requires auth)
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    const list = await fetchAdminUmkms(); // ADMIN endpoint, not public
    setUmkms(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // UMKM HANDLERS
  // ============================================================
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
    setIsHalal(false);
    setHalalNumber('');
    setCertifications([]);
    setIsModalOpen(true);
  };

  const openEditModal = (umkm: UMKM) => {
    setEditingUmkm(umkm);
    setName(umkm.name);
    setOwner(umkm.owner);
    setCategory(umkm.category);
    setAddress(umkm.address);
    setPhone(umkm.phone || '');
    setWhatsapp(umkm.whatsapp || '');
    setGmapsUrl(umkm.gmapsUrl || '');
    setGmapsEmbed(umkm.gmapsEmbed || '');
    setDescription(umkm.description || '');
    setLandingText(umkm.landingText || '');
    setProfileImage(umkm.profileImage || '');
    setIsHalal(Boolean(umkm.isHalal));
    setHalalNumber(umkm.halalNumber || '');
    setCertifications(umkm.certifications || []);
    setIsModalOpen(true);
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmitUmkm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const cleanEmbed = parseGmapsEmbedUrl(gmapsEmbed, `${name} ${address} Korowelang Kulon Kendal`);

    const payload: Partial<UMKM> = {
      name,
      owner,
      category,
      address: address || 'Desa Korowelang Kulon',
      phone,
      whatsapp: whatsapp || phone,
      gmapsUrl,
      gmapsEmbed: cleanEmbed,
      description,
      landingText,
      profileImage,
      isHalal,
      halalNumber: isHalal ? halalNumber : '',
      certifications,
    };

    if (editingUmkm) {
      const res = await updateUmkm(editingUmkm.id, payload);
      if (res.success && res.data) {
        setUmkms((prev) =>
          prev.map((u) => (String(u.id) === String(editingUmkm.id) ? { ...u, ...res.data } : u))
        );
        setIsModalOpen(false);
      } else {
        alert(res.error || 'Gagal memperbarui data UMKM.');
      }
    } else {
      const res = await createUmkm(payload);
      if (res.success && res.data) {
        setUmkms((prev) => [res.data!, ...prev]);
        setIsModalOpen(false);
      } else {
        alert(res.error || 'Gagal membuat UMKM baru.');
      }
    }

    setSubmitting(false);
    // Refresh data from server to ensure sync
    await loadData();
  };

  const handleDeleteUmkm = async (id: number | string) => {
    if (confirm('Apakah Anda yakin ingin menghapus UMKM ini beserta seluruh produknya?')) {
      const res = await deleteUmkm(id);
      if (res.success) {
        setUmkms((prev) => prev.filter((u) => String(u.id) !== String(id)));
      } else {
        alert(res.error || 'Gagal menghapus UMKM.');
      }
    }
  };

  // ============================================================
  // PRODUCT HANDLERS (Integrated in UMKM)
  // ============================================================
  const openProductModal = (umkm: UMKM) => {
    setSelectedUmkmForProducts(umkm);
    setIsProductFormOpen(false);
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openAddProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setPUnit('pcs');
    setPDescription('');
    setPImage('');
    setPIsHalal(Boolean(selectedUmkmForProducts?.isHalal));
    setPHalalNumber(selectedUmkmForProducts?.halalNumber || '');
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (prod: UMKMProduct) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(prod.price.toString());
    setPUnit(prod.unit || 'pcs');
    setPDescription(prod.description || '');
    setPImage(prod.image || '');
    setPIsHalal(Boolean(prod.isHalal));
    setPHalalNumber(prod.halalNumber || '');
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUmkmForProducts) return;
    setProductSubmitting(true);

    const productPayload: Partial<UMKMProduct> = {
      umkmId: selectedUmkmForProducts.id as number,
      name: pName,
      price: parseFloat(pPrice) || 0,
      unit: pUnit,
      description: pDescription,
      image: pImage,
      isHalal: pIsHalal,
      halalNumber: pIsHalal ? pHalalNumber : '',
    };

    if (editingProduct) {
      // Update existing product
      const res = await updateProduct(editingProduct.id, productPayload);
      if (res.success && res.data) {
        const updatedProducts = (selectedUmkmForProducts.products || []).map((p) =>
          String(p.id) === String(editingProduct.id) ? res.data! : p
        );
        const updatedUmkm = { ...selectedUmkmForProducts, products: updatedProducts };
        setSelectedUmkmForProducts(updatedUmkm);
        setUmkms((prev) =>
          prev.map((u) => (String(u.id) === String(updatedUmkm.id) ? updatedUmkm : u))
        );
        setIsProductFormOpen(false);
      } else {
        alert(res.error || 'Gagal memperbarui produk.');
      }
    } else {
      // Create new product
      const res = await createProduct(productPayload);
      if (res.success && res.data) {
        const updatedProducts = [res.data, ...(selectedUmkmForProducts.products || [])];
        const updatedUmkm = { ...selectedUmkmForProducts, products: updatedProducts };
        setSelectedUmkmForProducts(updatedUmkm);
        setUmkms((prev) =>
          prev.map((u) => (String(u.id) === String(updatedUmkm.id) ? updatedUmkm : u))
        );
        setIsProductFormOpen(false);
      } else {
        alert(res.error || 'Gagal menyimpan produk.');
      }
    }

    setProductSubmitting(false);
  };

  const handleDeleteProduct = async (productId: number | string) => {
    if (!selectedUmkmForProducts) return;
    if (confirm('Hapus produk ini dari UMKM?')) {
      const res = await deleteProduct(productId);
      if (res.success) {
        const updatedProducts = (selectedUmkmForProducts.products || []).filter(
          (p) => String(p.id) !== String(productId)
        );
        const updatedUmkm = { ...selectedUmkmForProducts, products: updatedProducts };
        setSelectedUmkmForProducts(updatedUmkm);
        setUmkms((prev) =>
          prev.map((u) => (String(u.id) === String(updatedUmkm.id) ? updatedUmkm : u))
        );
      } else {
        alert(res.error || 'Gagal menghapus produk.');
      }
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Kelola Data & Produk UMKM</h1>
            <p className="text-xs text-gray-500">
              Kelola pendaftaran usaha warga dan tambah/edit katalog produk langsung di masing-masing UMKM.
            </p>
          </div>
          <SoftButton variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Daftarkan UMKM Baru
          </SoftButton>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-semibold">Memuat data UMKM...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && umkms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-700">Belum ada data UMKM</h3>
              <p className="text-xs text-gray-500 mt-1">
                Klik tombol &ldquo;Daftarkan UMKM Baru&rdquo; untuk menambahkan UMKM pertama.
              </p>
            </div>
          </div>
        )}

        {/* UMKM Cards Grid */}
        {!loading && umkms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {umkms.map((umkm) => (
              <SoftCard key={umkm.id} className="flex flex-col justify-between gap-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
                    {umkm.profileImage ? (
                      <img
                        src={umkm.profileImage}
                        alt={umkm.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=200&q=60';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    {umkm.isHalal && (
                      <HalalCornerBadge className="absolute top-1 right-1 z-10 shadow-md" size="sm" showText={false} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {umkm.category}
                        </span>
                        {umkm.isHalal && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#672982] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            <HalalIndonesiaLogo className="w-3 h-3.5 text-[#672982]" />
                            Halal Indonesia
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        {umkm.products?.length || 0} Produk
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-gray-900 truncate">{umkm.name}</h3>
                    <p className="text-xs text-gray-600">Pemilik: {umkm.owner}</p>
                    {umkm.isHalal && umkm.halalNumber && (
                      <p className="text-[11px] font-bold text-[#672982] flex items-center gap-1">
                        <HalalIndonesiaLogo className="w-3 h-3 text-[#672982]" />
                        No. Halal: {umkm.halalNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      {umkm.address}
                    </p>
                    {umkm.certifications && umkm.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {umkm.certifications.slice(0, 3).map((c, i) => (
                          <span key={i} className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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
                    <SoftButton
                      variant="default"
                      size="sm"
                      onClick={() => openEditModal(umkm)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit UMKM
                    </SoftButton>
                    <SoftButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUmkm(umkm.id)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Hapus
                    </SoftButton>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        )}

        {/* MODAL 1: FORM ADD / EDIT DATA UMKM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto soft-card p-6 md:p-8 bg-[#eef2f6]">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingUmkm ? 'Edit Data UMKM' : 'Pendaftaran UMKM Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl soft-button text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitUmkm} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput
                    label="Nama UMKM"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <SoftInput
                    label="Nama Pemilik"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Kategori</label>
                    <select
                      className="soft-input w-full p-3 text-sm rounded-2xl"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Kuliner">Kuliner</option>
                      <option value="Makanan Ringan">Makanan Ringan</option>
                      <option value="Kerajinan & Fashion">Kerajinan & Fashion</option>
                      <option value="Pertanian">Pertanian</option>
                      <option value="Jasa">Jasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <SoftInput
                    label="Nomor WhatsApp (contoh: 6281234567890)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="628..."
                  />
                </div>

                <SoftInput
                  label="Alamat Lengkap"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                {/* SECTION: SERTIFIKASI & LEGALITAS UMKM (KHUSUS KULINER / SEMUA) */}
                <div className="p-4 rounded-2xl bg-white/80 border border-purple-200/80 flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#672982] flex items-center justify-center shrink-0 border border-purple-200">
                        <HalalIndonesiaLogo className="w-5 h-6 text-[#672982]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-gray-900">Sertifikasi Halal Indonesia (BPJPH / MUI)</h4>
                          {(category === 'Kuliner' || category === 'Makanan Ringan') && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                              Disarankan untuk Kuliner
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">Aktifkan untuk menampilkan logo Halal Indonesia pada foto UMKM & katalog</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHalal}
                        onChange={(e) => setIsHalal(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#672982]"></div>
                    </label>
                  </div>

                  {isHalal && (
                    <SoftInput
                      label="Nomor Registrasi Sertifikat Halal (Contoh: ID33110001234560723)"
                      value={halalNumber}
                      onChange={(e) => setHalalNumber(e.target.value)}
                      placeholder="Contoh: ID33110001234560723"
                      icon={<Award className="w-4 h-4 text-[#672982]" />}
                    />
                  )}

                  <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                      Sertifikasi & Izin Usaha Tambahan
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Halal MUI/BPJPH', 'P-IRT', 'BPOM', 'NIB', 'Unggulan Desa', 'SNI'].map((cert) => {
                        const active = certifications.includes(cert);
                        return (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCertification(cert)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              active
                                ? 'bg-[#672982] text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {active && <Check className="w-3.5 h-3.5" />}
                            {cert}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SoftInput
                    label="URL Google Maps (Buka di App Maps)"
                    value={gmapsUrl}
                    onChange={(e) => setGmapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                  />
                  <div className="flex flex-col gap-1">
                    <SoftInput
                      label="Embed Iframe Google Maps"
                      value={gmapsEmbed}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = val.match(/src=["']([^"']+)["']/i);
                        setGmapsEmbed(match ? match[1] : val);
                      }}
                      placeholder='https://www.google.com/maps/embed?... (atau paste full <iframe>)'
                    />
                    <p className="text-[11px] text-gray-500 ml-1">
                      💡 <em>Bisa langsung copy-paste kode &lt;iframe...&gt; dari Google Maps &quot;Sematkan Peta&quot;.</em>
                    </p>
                  </div>
                </div>

                <ImageUploadInput
                  label="Foto Profil / Logo UMKM"
                  value={profileImage}
                  onChange={setProfileImage}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                    Ringkasan Teks Landing Page
                  </label>
                  <textarea
                    rows={2}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={landingText}
                    onChange={(e) => setLandingText(e.target.value)}
                    placeholder="Kalimat promosi singkat di card landing page..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                    Deskripsi Lengkap Usaha
                  </label>
                  <textarea
                    rows={4}
                    className="soft-input w-full p-3 text-sm rounded-2xl"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Penjelasan detail sejarah, bahan baku, keunggulan..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <SoftButton
                    type="button"
                    variant="default"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </SoftButton>
                  <SoftButton
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    icon={<Check className="w-4 h-4" />}
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Data UMKM'}
                  </SoftButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: INTEGRATED KELOLA PRODUK */}
        {isProductModalOpen && selectedUmkmForProducts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
                    <SoftButton
                      variant="primary"
                      size="sm"
                      onClick={openAddProductForm}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Tambah Produk Baru
                    </SoftButton>
                  )}
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="p-2 rounded-xl soft-button text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SECTION: FORM TAMBAH / EDIT PRODUK */}
              {isProductFormOpen ? (
                <form
                  onSubmit={handleSaveProduct}
                  className="p-5 rounded-2xl soft-card-inset flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-300/60">
                    <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
                      {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsProductFormOpen(false)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
                    </button>
                  </div>

                  <SoftInput
                    label="Nama Produk"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <SoftInput
                      label="Harga (Rp)"
                      type="number"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      required
                      min="0"
                    />
                    <SoftInput
                      label="Satuan (pcs/pack/kg/ekor)"
                      value={pUnit}
                      onChange={(e) => setPUnit(e.target.value)}
                      required
                    />
                  </div>

                  <ImageUploadInput label="Foto Produk" value={pImage} onChange={setPImage} />

                  {/* HALAL TOGGLE PRODUK */}
                  <div className="p-3.5 rounded-2xl bg-white/80 border border-purple-200 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#672982] flex items-center justify-center shrink-0 border border-purple-200">
                          <HalalIndonesiaLogo className="w-4 h-5 text-[#672982]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900">Produk Bersertifikat Halal Indonesia</h4>
                          <p className="text-[11px] text-gray-500">Tandai jika varian produk ini tersertifikasi halal resmi</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pIsHalal}
                          onChange={(e) => setPIsHalal(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#672982]"></div>
                      </label>
                    </div>

                    {pIsHalal && (
                      <SoftInput
                        label="Nomor Sertifikat Halal Produk (Opsional)"
                        value={pHalalNumber}
                        onChange={(e) => setPHalalNumber(e.target.value)}
                        placeholder="Contoh: ID3311000..."
                        icon={<Award className="w-4 h-4 text-[#672982]" />}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                      Deskripsi Produk
                    </label>
                    <textarea
                      rows={3}
                      className="soft-input w-full p-3 text-sm rounded-2xl"
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      placeholder="Keunggulan produk, varian rasa, ketahanan..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-300/60">
                    <SoftButton
                      type="button"
                      variant="default"
                      onClick={() => setIsProductFormOpen(false)}
                    >
                      Batal
                    </SoftButton>
                    <SoftButton
                      type="submit"
                      variant="primary"
                      disabled={productSubmitting}
                      icon={<Check className="w-4 h-4" />}
                    >
                      {productSubmitting
                        ? 'Menyimpan...'
                        : editingProduct
                        ? 'Simpan Perubahan'
                        : 'Tambah Produk'}
                    </SoftButton>
                  </div>
                </form>
              ) : (
                /* SECTION: DAFTAR PRODUK */
                <div className="flex flex-col gap-4">
                  {(selectedUmkmForProducts.products || []).length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs font-semibold rounded-2xl soft-card-inset">
                      Belum ada produk yang didaftarkan untuk UMKM ini.
                      <br />
                      Klik tombol &quot;+ Tambah Produk Baru&quot; di atas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUmkmForProducts.products?.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-4 rounded-2xl soft-card flex flex-col justify-between gap-3"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              {prod.isHalal && (
                                <HalalCornerBadge className="absolute top-1 right-1 z-10 shadow-sm" size="sm" showText={false} />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-xs truncate">{prod.name}</h4>
                                {prod.isHalal && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#672982] bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200">
                                    <HalalIndonesiaLogo className="w-2.5 h-3 text-[#672982]" />
                                    Halal
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-extrabold text-blue-600 mt-0.5">
                                Rp {prod.price.toLocaleString('id-ID')} / {prod.unit}
                              </span>
                              {prod.isHalal && prod.halalNumber && (
                                <span className="text-[10px] text-[#672982] font-semibold truncate flex items-center gap-1">
                                  <HalalIndonesiaLogo className="w-2.5 h-3 text-[#672982]" />
                                  No. {prod.halalNumber}
                                </span>
                              )}
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                                {prod.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-2">
                            <SoftButton
                              variant="default"
                              size="sm"
                              onClick={() => openEditProductForm(prod)}
                              icon={<Edit2 className="w-3 h-3" />}
                            >
                              Edit
                            </SoftButton>
                            <SoftButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteProduct(prod.id)}
                              icon={<Trash2 className="w-3 h-3" />}
                            >
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
