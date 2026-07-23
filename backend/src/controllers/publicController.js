const mockData = require('../data/store');

// GET /api/public/umkm
const getUmkmList = (req, res) => {
  try {
    const { search, category } = req.query;
    let result = [...mockData.umkms];

    if (category && category !== 'Semua') {
      result = result.filter(u => u.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.description.toLowerCase().includes(q) ||
        u.owner.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data UMKM',
      error: error.message
    });
  }
};

// GET /api/public/umkm/:id
const getUmkmById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const umkm = mockData.umkms.find(u => u.id === id);

    if (!umkm) {
      return res.status(404).json({
        success: false,
        message: 'UMKM tidak ditemukan'
      });
    }

    // Attach products associated with this UMKM
    const products = mockData.products.filter(p => p.umkmId === id);

    return res.status(200).json({
      success: true,
      data: {
        ...umkm,
        products
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail UMKM',
      error: error.message
    });
  }
};

// GET /api/public/konten
const getDynamicContent = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: mockData.dynamicContent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data konten dinamis',
      error: error.message
    });
  }
};

// POST /api/public/feedback
const submitFeedback = (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan pesan feedback wajib diisi.'
      });
    }

    const newFeedback = {
      id: mockData.feedbacks.length + 1,
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    mockData.feedbacks.push(newFeedback);

    return res.status(201).json({
      success: true,
      message: 'Terima kasih! Feedback Anda telah berhasil dikirim.',
      data: newFeedback
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim feedback',
      error: error.message
    });
  }
};

module.exports = {
  getUmkmList,
  getUmkmById,
  getDynamicContent,
  submitFeedback
};
