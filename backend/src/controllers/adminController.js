const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { generateToken } = require('../config/jwt');
const { verifyPassword, hashPassword } = require('../utils/password');

// POST /api/admin/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const result = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    const user = result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const isMatch = await verifyPassword(user.password, password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
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
        bio: user.bio
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login',
      error: error.message
    });
  }
};

// GET /api/admin/profile
const getProfile = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const result = await db.select().from(schema.users).where(eq(schema.users.id, req.user.id));
    const user = result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const { password, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/profile
const updateProfile = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { name, phone, bio, avatar, password } = req.body;
    const updatePayload = {};

    if (name) updatePayload.name = name;
    if (phone) updatePayload.phone = phone;
    if (bio) updatePayload.bio = bio;
    if (avatar) updatePayload.avatar = avatar;
    if (password) updatePayload.password = await hashPassword(password);

    const updated = await db.update(schema.users)
      .set(updatePayload)
      .where(eq(schema.users.id, req.user.id))
      .returning();

    if (updated.length > 0) {
      const { password: pwd, ...userWithoutPassword } = updated[0];
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: userWithoutPassword
      });
    }

    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- UMKM CRUD ---

const getAllUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    let umkms = await db.select().from(schema.umkms);
    const allProducts = await db.select().from(schema.products);
    
    umkms = umkms.map(u => ({
      ...u,
      products: allProducts.filter(p => p.umkmId === u.id)
    }));

    return res.status(200).json({
      success: true,
      data: umkms
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { name, owner, category, address, phone, whatsapp, gmapsUrl, gmapsEmbed, description, landingText, profileImage, bannerImage, certifications, latitude, longitude } = req.body;

    const newUmkmPayload = {
      name,
      owner,
      category: category || 'Kuliner',
      address: address || 'Desa Kutoharjo',
      phone: phone || '',
      whatsapp: whatsapp || phone || '',
      gmapsUrl: gmapsUrl || '',
      gmapsEmbed: gmapsEmbed || '',
      description: description || '',
      landingText: landingText || '',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviewCount: 0,
      certifications: certifications || ['Unggulan Desa'],
      latitude: latitude ? String(latitude) : '-6.890000',
      longitude: longitude ? String(longitude) : '110.145000',
    };

    const inserted = await db.insert(schema.umkms).values(newUmkmPayload).returning();
    if (inserted.length > 0) {
      return res.status(201).json({
        success: true,
        message: 'UMKM baru berhasil didaftarkan.',
        data: { ...inserted[0], products: [] }
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal mendaftarkan UMKM.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);

    const updated = await db.update(schema.umkms)
      .set(req.body)
      .where(eq(schema.umkms.id, id))
      .returning();

    if (updated.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Data UMKM berhasil diperbarui.',
        data: updated[0]
      });
    }

    return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUmkm = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);

    const deleted = await db.delete(schema.umkms).where(eq(schema.umkms.id, id)).returning();
    if (deleted.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'UMKM dan produk terkait berhasil dihapus.'
      });
    }

    return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- PRODUK CRUD ---

const getAllProducts = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { umkmId } = req.query;
    let products = [];

    if (umkmId) {
      products = await db.select().from(schema.products).where(eq(schema.products.umkmId, parseInt(umkmId)));
    } else {
      products = await db.select().from(schema.products);
    }

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { umkmId, name, price, unit, description, image } = req.body;

    const payload = {
      umkmId: parseInt(umkmId),
      name,
      price: parseFloat(price),
      unit: unit || 'pcs',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80'
    };

    const inserted = await db.insert(schema.products).values(payload).returning();
    if (inserted.length > 0) {
      return res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan.',
        data: inserted[0]
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal menambahkan produk.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);

    const updated = await db.update(schema.products)
      .set(req.body)
      .where(eq(schema.products.id, id))
      .returning();

    if (updated.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui.',
        data: updated[0]
      });
    }

    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);

    const deleted = await db.delete(schema.products).where(eq(schema.products.id, id)).returning();
    if (deleted.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus.'
      });
    }

    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- FEEDBACK ---

const getFeedbacks = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const feedbacks = await db.select().from(schema.feedbacks);

    return res.status(200).json({
      success: true,
      data: feedbacks
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
  getFeedbacks
};
