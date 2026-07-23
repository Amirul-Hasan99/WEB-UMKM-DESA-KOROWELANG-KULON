const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// Unprotected Auth Route
router.post('/login', login);

// Admin Protected Routes (Accessible by Admin and Super Admin)
router.use(authenticateToken);
router.use(requireRole('admin', 'superadmin'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// UMKM Management
router.get('/umkm', getAllUmkm);
router.post('/umkm', createUmkm);
router.put('/umkm/:id', updateUmkm);
router.delete('/umkm/:id', deleteUmkm);

// Product Management
router.get('/produk', getAllProducts);
router.post('/produk', createProduct);
router.put('/produk/:id', updateProduct);
router.delete('/produk/:id', deleteProduct);

// Feedback List
router.get('/feedback', getFeedbacks);

module.exports = router;
