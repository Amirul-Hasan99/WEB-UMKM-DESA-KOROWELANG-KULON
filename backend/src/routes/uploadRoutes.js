const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/admin/upload — requires authentication (accepts 'image', 'video', 'file', or 'media')
router.post("/", authenticateToken, (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File tidak didukung atau melebihi batas ukuran (50MB).",
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.files?.[0] || req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file foto atau video yang diunggah.",
      });
    }

    const isVideo = file.mimetype.startsWith('video/');
    const mediaUrl = await uploadToCloudinary(file.buffer, "umkm-korowelang-kulon", file.mimetype);

    return res.status(200).json({
      success: true,
      message: `${isVideo ? 'Video' : 'Foto'} berhasil diunggah.`,
      url: mediaUrl,
      imageUrl: mediaUrl,
      mediaUrl,
      mediaType: isVideo ? 'video' : 'image',
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengunggah media.",
      error: error.message,
    });
  }
});

module.exports = router;
