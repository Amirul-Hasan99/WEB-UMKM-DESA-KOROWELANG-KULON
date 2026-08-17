const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { generateToken } = require('../config/jwt');
const { verifyPassword, hashPassword } = require('../utils/password');
const mockData = require('../data/store');

// POST /api/admin/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;

    if (db) {
      try {
        const result = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
        if (result.length > 0) user = result[0];
      } catch (err) {
        console.warn('DB login query failed, falling back to mockData:', err.message);
      }
    }

    if (!user) {
      user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    let isMatch = false;
    // Bypass hash check for unhashed mock passwords
    if (user.password === password) {
      isMatch = true;
    } else {
      isMatch = await verifyPassword(user.password, password);
    }
    
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
    let user = null;
    if (db) {
      try {
        const result = await db.select().from(schema.users).where(eq(schema.users.id, req.user.id));
        if (result.length > 0) user = result[0];
      } catch (err) {}
    }

    if (!user) {
      user = mockData.users.find(u => u.id === req.user.id);
    }

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
    const { name, phone, bio, avatar, password } = req.body;
    const updatePayload = {};

    if (name) updatePayload.name = name;
    if (phone) updatePayload.phone = phone;
    if (bio) updatePayload.bio = bio;
    if (avatar) updatePayload.avatar = avatar;
    if (password) updatePayload.password = await hashPassword(password);

    if (db) {
      try {
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
      } catch (err) {}
    }

    // Fallback mockData
    const userIndex = mockData.users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      if (name) mockData.users[userIndex].name = name;
      if (phone) mockData.users[userIndex].phone = phone;
      if (bio) mockData.users[userIndex].bio = bio;
      if (avatar) mockData.users[userIndex].avatar = avatar;
      if (password) mockData.users[userIndex].password = password;

      const { password: pwd, ...updatedUser } = mockData.users[userIndex];
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: updatedUser
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
    let umkms = [];
    if (db) {
      try {
        umkms = await db.select().from(schema.umkms);
        const allProducts = await db.select().from(schema.products);
        umkms = umkms.map(u => ({
          ...u,
          products: allProducts.filter(p => p.umkmId === u.id)
        }));
      } catch (err) {}
    }

    if (!umkms || umkms.length === 0) {
      umkms = mockData.umkms.map(u => ({
        ...u,
        products: mockData.products.filter(p => p.umkmId === u.id)
      }));
    }

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

    if (db) {
      try {
        const inserted = await db.insert(schema.umkms).values(newUmkmPayload).returning();
        if (inserted.length > 0) {
          return res.status(201).json({
            success: true,
            message: 'UMKM baru berhasil didaftarkan.',
            data: { ...inserted[0], products: [] }
          });
        }
      } catch (err) {}
    }

    // Fallback mockData
    const mockUmkm = {
      id: mockData.umkms.length > 0 ? Math.max(...mockData.umkms.map(u => u.id)) + 1 : 1,
      ...newUmkmPayload,
      createdAt: new Date().toISOString(),
      products: []
    };
    mockData.umkms.unshift(mockUmkm);

    return res.status(201).json({
      success: true,
      message: 'UMKM baru berhasil didaftarkan.',
      data: mockUmkm
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUmkm = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (db) {
      try {
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
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.umkms.findIndex(u => u.id === id);
    if (index !== -1) {
      mockData.umkms[index] = { ...mockData.umkms[index], ...req.body };
      return res.status(200).json({
        success: true,
        message: 'Data UMKM berhasil diperbarui.',
        data: mockData.umkms[index]
      });
    }

    return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUmkm = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (db) {
      try {
        await db.delete(schema.umkms).where(eq(schema.umkms.id, id));
        return res.status(200).json({
          success: true,
          message: 'UMKM dan produk terkait berhasil dihapus.'
        });
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.umkms.findIndex(u => u.id === id);
    if (index !== -1) {
      mockData.umkms.splice(index, 1);
      mockData.products = mockData.products.filter(p => p.umkmId !== id);
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
    const { umkmId } = req.query;
    let products = [];

    if (db) {
      try {
        if (umkmId) {
          products = await db.select().from(schema.products).where(eq(schema.products.umkmId, parseInt(umkmId)));
        } else {
          products = await db.select().from(schema.products);
        }
      } catch (err) {}
    }

    if (!products || products.length === 0) {
      products = [...mockData.products];
      if (umkmId) products = products.filter(p => p.umkmId === parseInt(umkmId));
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
    const { umkmId, name, price, unit, description, image } = req.body;

    const payload = {
      umkmId: parseInt(umkmId),
      name,
      price: parseFloat(price),
      unit: unit || 'pcs',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80'
    };

    if (db) {
      try {
        const inserted = await db.insert(schema.products).values(payload).returning();
        if (inserted.length > 0) {
          return res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan.',
            data: inserted[0]
          });
        }
      } catch (err) {}
    }

    // Fallback mockData
    const newProduct = {
      id: mockData.products.length > 0 ? Math.max(...mockData.products.map(p => p.id)) + 1 : 1,
      ...payload
    };
    mockData.products.push(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan.',
      data: newProduct
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (db) {
      try {
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
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.products[index] = { ...mockData.products[index], ...req.body };
      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui.',
        data: mockData.products[index]
      });
    }

    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (db) {
      try {
        await db.delete(schema.products).where(eq(schema.products.id, id));
        return res.status(200).json({
          success: true,
          message: 'Produk berhasil dihapus.'
        });
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.products.splice(index, 1);
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
    let feedbacks = [];

    if (db) {
      try {
        feedbacks = await db.select().from(schema.feedbacks);
      } catch (err) {}
    }

    if (!feedbacks || feedbacks.length === 0) {
      feedbacks = mockData.feedbacks;
    }

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
