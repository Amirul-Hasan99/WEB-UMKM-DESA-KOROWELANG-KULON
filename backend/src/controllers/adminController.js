const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { generateToken } = require('../config/jwt');
const { verifyPassword, hashPassword } = require('../utils/password');

// ============================================================
// POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database tidak terhubung. Hubungi administrator.',
      });
    }

    const result = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    const user = result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const isMatch = await verifyPassword(user.password, password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak memiliki hak akses ke panel admin.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat proses login.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================================
// GET /api/admin/profile
// ============================================================
const getProfile = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const result = await db.select().from(schema.users).where(eq(schema.users.id, req.user.id));
    const user = result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const { password: _pwd, ...userWithoutPassword } = user;
    return res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/admin/profile
// ============================================================
const updateProfile = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { name, phone, bio, avatar, password } = req.body;
    const updatePayload = {};

    if (name !== undefined) updatePayload.name = name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (bio !== undefined) updatePayload.bio = bio;
    if (avatar !== undefined) updatePayload.avatar = avatar;
    if (password) updatePayload.password = await hashPassword(password);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui.' });
    }

    const updated = await db
      .update(schema.users)
      .set(updatePayload)
      .where(eq(schema.users.id, req.user.id))
      .returning();

    if (updated.length > 0) {
      const { password: _pwd, ...userWithoutPassword } = updated[0];
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: userWithoutPassword,
      });
    }

    return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// --- UMKM CRUD ---
// ============================================================

// GET /api/admin/umkm
const getAllUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    let umkms = await db.select().from(schema.umkms);
    const allProducts = await db.select().from(schema.products);

    umkms = umkms.map((u) => ({
      ...u,
      products: allProducts.filter((p) => p.umkmId === u.id),
    }));

    return res.status(200).json({
      success: true,
      count: umkms.length,
      data: umkms,
    });
  } catch (error) {
    console.error('getAllUmkm error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/umkm
const createUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const {
      name,
      owner,
      category,
      address,
      phone,
      whatsapp,
      whatsappNumber,
      gmapsUrl,
      mapsUrl,
      gmapsEmbed,
      description,
      landingText,
      profileImage,
      imageUrl,
      bannerImage,
      certifications,
      isHalal,
      halalNumber,
      latitude,
      longitude,
    } = req.body;

    // Field normalization (support both naming conventions)
    const newUmkmPayload = {
      name,
      owner: owner || '',
      category: category || 'Kuliner',
      address: address || 'Desa Kutoharjo',
      phone: phone || '',
      whatsapp: whatsapp || whatsappNumber || phone || '',
      gmapsUrl: gmapsUrl || mapsUrl || '',
      gmapsEmbed: gmapsEmbed || '',
      description: description || '',
      landingText: landingText || '',
      profileImage: profileImage || imageUrl || '',
      bannerImage: bannerImage || '',
      rating: 5.0,
      reviewCount: 0,
      isHalal: isHalal ? 1 : 0,
      halalNumber: halalNumber || '',
      certifications: certifications || ['Unggulan Desa'],
      latitude: latitude ? String(latitude) : '-6.890000',
      longitude: longitude ? String(longitude) : '110.145000',
    };

    const inserted = await db.insert(schema.umkms).values(newUmkmPayload).returning();
    if (inserted.length > 0) {
      return res.status(201).json({
        success: true,
        message: 'UMKM baru berhasil didaftarkan.',
        data: { ...inserted[0], products: [] },
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal mendaftarkan UMKM.' });
  } catch (error) {
    console.error('createUmkm error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// PUT /api/admin/umkm/:id
const updateUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID UMKM tidak valid.' });
    }

    // Only allow updating these fields — prevent overriding id, createdAt, etc.
    const {
      name,
      owner,
      category,
      address,
      phone,
      whatsapp,
      whatsappNumber,
      gmapsUrl,
      mapsUrl,
      gmapsEmbed,
      description,
      landingText,
      profileImage,
      imageUrl,
      bannerImage,
      certifications,
      isHalal,
      halalNumber,
      latitude,
      longitude,
    } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (owner !== undefined) updatePayload.owner = owner;
    if (category !== undefined) updatePayload.category = category;
    if (address !== undefined) updatePayload.address = address;
    if (phone !== undefined) updatePayload.phone = phone;
    if (whatsapp !== undefined) updatePayload.whatsapp = whatsapp;
    else if (whatsappNumber !== undefined) updatePayload.whatsapp = whatsappNumber;
    if (gmapsUrl !== undefined) updatePayload.gmapsUrl = gmapsUrl;
    else if (mapsUrl !== undefined) updatePayload.gmapsUrl = mapsUrl;
    if (gmapsEmbed !== undefined) updatePayload.gmapsEmbed = gmapsEmbed;
    if (description !== undefined) updatePayload.description = description;
    if (landingText !== undefined) updatePayload.landingText = landingText;
    if (profileImage !== undefined) updatePayload.profileImage = profileImage;
    else if (imageUrl !== undefined) updatePayload.profileImage = imageUrl;
    if (bannerImage !== undefined) updatePayload.bannerImage = bannerImage;
    if (certifications !== undefined) updatePayload.certifications = certifications;
    if (isHalal !== undefined) updatePayload.isHalal = isHalal ? 1 : 0;
    if (halalNumber !== undefined) updatePayload.halalNumber = halalNumber;
    if (latitude !== undefined) updatePayload.latitude = String(latitude);
    if (longitude !== undefined) updatePayload.longitude = String(longitude);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui.' });
    }

    const updated = await db
      .update(schema.umkms)
      .set(updatePayload)
      .where(eq(schema.umkms.id, id))
      .returning();

    if (updated.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Data UMKM berhasil diperbarui.',
        data: updated[0],
      });
    }

    return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
  } catch (error) {
    console.error('updateUmkm error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/umkm/:id
const deleteUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID UMKM tidak valid.' });
    }

    // Products will be cascade-deleted by PostgreSQL FK constraint (onDelete: 'cascade')
    const deleted = await db.delete(schema.umkms).where(eq(schema.umkms.id, id)).returning();
    if (deleted.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'UMKM dan produk terkait berhasil dihapus.',
      });
    }

    return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
  } catch (error) {
    console.error('deleteUmkm error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// --- PRODUK CRUD ---
// ============================================================

// GET /api/admin/products?umkmId=1
const getAllProducts = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { umkmId } = req.query;
    let products = [];

    if (umkmId) {
      const umkmIdInt = parseInt(umkmId);
      if (isNaN(umkmIdInt)) {
        return res.status(400).json({ success: false, message: 'umkmId tidak valid.' });
      }
      products = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.umkmId, umkmIdInt));
    } else {
      products = await db.select().from(schema.products);
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { umkmId, name, title, price, unit, description, image, imageUrl, isHalal, halalNumber } = req.body;

    const umkmIdInt = parseInt(umkmId);
    if (isNaN(umkmIdInt)) {
      return res.status(400).json({ success: false, message: 'umkmId tidak valid.' });
    }

    // Verify UMKM exists
    const umkmCheck = await db.select().from(schema.umkms).where(eq(schema.umkms.id, umkmIdInt));
    if (umkmCheck.length === 0) {
      return res.status(404).json({ success: false, message: `UMKM dengan ID ${umkmIdInt} tidak ditemukan.` });
    }

    const productName = name || title;
    if (!productName) {
      return res.status(400).json({ success: false, message: 'Nama produk wajib diisi.' });
    }

    const payload = {
      umkmId: umkmIdInt,
      name: productName,
      price: parseFloat(price) || 0,
      unit: unit || 'pcs',
      description: description || '',
      image: image || imageUrl || '',
      isHalal: isHalal ? 1 : 0,
      halalNumber: halalNumber || '',
    };

    const inserted = await db.insert(schema.products).values(payload).returning();
    if (inserted.length > 0) {
      return res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan.',
        data: inserted[0],
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal menambahkan produk.' });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID produk tidak valid.' });
    }

    // Only allow updating safe fields — don't allow changing id or umkmId arbitrarily
    const { name, title, price, unit, description, image, imageUrl, isHalal, halalNumber, umkmId } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    else if (title !== undefined) updatePayload.name = title;
    if (price !== undefined) updatePayload.price = parseFloat(price) || 0;
    if (unit !== undefined) updatePayload.unit = unit;
    if (description !== undefined) updatePayload.description = description;
    if (image !== undefined) updatePayload.image = image;
    else if (imageUrl !== undefined) updatePayload.image = imageUrl;
    if (isHalal !== undefined) updatePayload.isHalal = isHalal ? 1 : 0;
    if (halalNumber !== undefined) updatePayload.halalNumber = halalNumber;
    if (umkmId !== undefined) updatePayload.umkmId = parseInt(umkmId);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui.' });
    }

    const updated = await db
      .update(schema.products)
      .set(updatePayload)
      .where(eq(schema.products.id, id))
      .returning();

    if (updated.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui.',
        data: updated[0],
      });
    }

    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID produk tidak valid.' });
    }

    const deleted = await db.delete(schema.products).where(eq(schema.products.id, id)).returning();
    if (deleted.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus.',
      });
    }

    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// --- FEEDBACK ---
// ============================================================

// GET /api/admin/feedbacks
const getFeedbacks = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const feedbacks = await db.select().from(schema.feedbacks);

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  getAllUmkm,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeedbacks,
};
