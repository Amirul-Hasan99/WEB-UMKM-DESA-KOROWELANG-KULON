const mockData = require('../data/store');
const { generateToken } = require('../config/jwt');

// POST /api/admin/login
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
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
const getProfile = (req, res) => {
  try {
    const user = mockData.users.find(u => u.id === req.user.id);
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
const updateProfile = (req, res) => {
  try {
    const userIndex = mockData.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const { name, phone, bio, avatar, password } = req.body;

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- UMKM CRUD ---

const getAllUmkm = (req, res) => {
  return res.status(200).json({
    success: true,
    data: mockData.umkms
  });
};

const createUmkm = (req, res) => {
  try {
    const { name, owner, category, address, phone, whatsapp, gmapsUrl, gmapsEmbed, description, landingText, profileImage, bannerImage } = req.body;

    if (!name || !owner || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nama UMKM, Pemilik, dan Kategori wajib diisi.'
      });
    }

    const newUmkm = {
      id: mockData.umkms.length > 0 ? Math.max(...mockData.umkms.map(u => u.id)) + 1 : 1,
      name,
      owner,
      category: category || 'Kuliner',
      address: address || 'Desa Korowelang Kulon',
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
      createdAt: new Date().toISOString()
    };

    mockData.umkms.push(newUmkm);

    return res.status(201).json({
      success: true,
      message: 'UMKM baru berhasil didaftarkan.',
      data: newUmkm
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUmkm = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.umkms.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    }

    mockData.umkms[index] = {
      ...mockData.umkms[index],
      ...req.body
    };

    return res.status(200).json({
      success: true,
      message: 'Data UMKM berhasil diperbarui.',
      data: mockData.umkms[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUmkm = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.umkms.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    }

    mockData.umkms.splice(index, 1);
    // Remove associated products as well
    mockData.products = mockData.products.filter(p => p.umkmId !== id);

    return res.status(200).json({
      success: true,
      message: 'UMKM dan produk terkait berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- PRODUK CRUD ---

const getAllProducts = (req, res) => {
  const { umkmId } = req.query;
  let products = [...mockData.products];
  if (umkmId) {
    products = products.filter(p => p.umkmId === parseInt(umkmId));
  }
  return res.status(200).json({
    success: true,
    data: products
  });
};

const createProduct = (req, res) => {
  try {
    const { umkmId, name, price, unit, description, image } = req.body;

    if (!umkmId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'UMKM ID, Nama Produk, dan Harga wajib diisi.'
      });
    }

    const newProduct = {
      id: mockData.products.length > 0 ? Math.max(...mockData.products.map(p => p.id)) + 1 : 1,
      umkmId: parseInt(umkmId),
      name,
      price: parseFloat(price),
      unit: unit || 'pcs',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80'
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

const updateProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    mockData.products[index] = {
      ...mockData.products[index],
      ...req.body
    };

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: mockData.products[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    mockData.products.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- FEEDBACK ---

const getFeedbacks = (req, res) => {
  return res.status(200).json({
    success: true,
    data: mockData.feedbacks
  });
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
