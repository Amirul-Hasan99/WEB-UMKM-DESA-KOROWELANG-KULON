const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/admin/upload — requires authentication
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file foto yang diunggah.",
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "umkm-korowelang-kulon");

    return res.status(200).json({
      success: true,
      message: "Foto berhasil diunggah.",
      url: imageUrl,
      imageUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengunggah foto.",
      error: error.message,
    });
  }
});

module.exports = router;
