const ExcelJS = require('exceljs');
const { db, schema } = require('../db');
const mockStore = require('../data/store'); // Fallback if DB not connected

// Helper to get data either from DB or fallback mock store
const getUmkmData = async () => {
  if (db) {
    try {
      return await db.select().from(schema.umkms);
    } catch (e) {}
  }
  return mockStore.umkms;
};

const getProductData = async () => {
  if (db) {
    try {
      return await db.select().from(schema.products);
    } catch (e) {}
  }
  return mockStore.products;
};

const getFeedbackData = async () => {
  if (db) {
    try {
      return await db.select().from(schema.feedbacks);
    } catch (e) {}
  }
  return mockStore.feedbacks;
};

// Export UMKM List to Excel
const exportUmkms = async (req, res) => {
  try {
    const umkms = await getUmkmData();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daftar UMKM');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nama UMKM', key: 'name', width: 30 },
      { header: 'Pemilik', key: 'owner', width: 25 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Alamat', key: 'address', width: 40 },
      { header: 'No. WhatsApp', key: 'whatsapp', width: 18 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Deskripsi', key: 'description', width: 45 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E40AF' }, // Royal Blue
    };

    umkms.forEach((u) => {
      worksheet.addRow({
        id: u.id,
        name: u.name,
        owner: u.owner,
        category: u.category,
        address: u.address,
        whatsapp: u.whatsapp || u.phone || '-',
        rating: u.rating || 5.0,
        description: u.description || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Daftar_UMKM_Kutoharjo.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data UMKM', error: error.message });
  }
};

// Export Products to Excel
const exportProducts = async (req, res) => {
  try {
    const products = await getProductData();
    const umkms = await getUmkmData();
    const umkmMap = new Map(umkms.map((u) => [u.id, u.name]));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Katalog Produk');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nama Produk', key: 'name', width: 35 },
      { header: 'Nama UMKM', key: 'umkmName', width: 30 },
      { header: 'Harga (Rp)', key: 'price', width: 15 },
      { header: 'Satuan', key: 'unit', width: 12 },
      { header: 'Deskripsi', key: 'description', width: 45 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '15803D' }, // Green
    };

    products.forEach((p) => {
      worksheet.addRow({
        id: p.id,
        name: p.name,
        umkmName: umkmMap.get(p.umkmId) || `UMKM #${p.umkmId}`,
        price: p.price,
        unit: p.unit || 'pcs',
        description: p.description || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Katalog_Produk_UMKM_Kutoharjo.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data produk', error: error.message });
  }
};

// Export Feedbacks to Excel
const exportFeedbacks = async (req, res) => {
  try {
    const feedbacks = await getFeedbackData();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Feedback');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nama Warga', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Pesan / Saran', key: 'message', width: 50 },
      { header: 'Tanggal Kirim', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4338CA' }, // Indigo
    };

    feedbacks.forEach((f) => {
      worksheet.addRow({
        id: f.id,
        name: f.name,
        email: f.email,
        message: f.message,
        createdAt: f.createdAt ? new Date(f.createdAt).toLocaleString('id-ID') : '-',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Feedback_Warga_Kutoharjo.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor feedback', error: error.message });
  }
};

module.exports = {
  exportUmkms,
  exportProducts,
  exportFeedbacks,
};
