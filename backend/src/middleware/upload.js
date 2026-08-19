const multer = require('multer');

// Use memory storage for serverless compatibility (Vercel)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WEBP, GIF) dan video (MP4, WEBM, MOV) yang diperbolehkan!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for photos & videos
  },
});

module.exports = upload;
