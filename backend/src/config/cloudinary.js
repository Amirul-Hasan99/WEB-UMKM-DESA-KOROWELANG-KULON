const cloudinary = require('cloudinary').v2;
require('dotenv').config();

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload buffer to Cloudinary and return secure URL.
 */
const uploadToCloudinary = (fileBuffer, folder = 'umkm-korowelang', mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured, fall back to base64 Data URL
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimetype};base64,${base64Data}`;
      return resolve(dataUrl);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
