const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { loginSchema, profileSchema, umkmSchema, umkmUpdateSchema, productSchema, productUpdateSchema } = require('../validators/schemas');

const adminController = require('../controllers/adminController');
const uploadRoutes = require('./uploadRoutes');
const exportRoutes = require('./exportRoutes');

const { loginLimiter } = require('../middleware/rateLimiter');

// Login Route (with Zod validation & Brute-Force Rate Limiting)
router.post('/login', loginLimiter, validate(loginSchema), adminController.login);

// Protected Admin & SuperAdmin Routes
router.use(authenticateToken);
router.use(requireRole('admin', 'superadmin'));

// Upload & Export sub-routes
router.use('/upload', uploadRoutes);
router.use('/export', exportRoutes);

// Profile
router.get('/profile', adminController.getProfile);
router.put('/profile', validate(profileSchema), adminController.updateProfile);

// UMKM CRUD
router.get('/umkm', adminController.getAllUmkm);
router.post('/umkm', validate(umkmSchema), adminController.createUmkm);
router.put('/umkm/:id', validate(umkmUpdateSchema), adminController.updateUmkm);
router.delete('/umkm/:id', adminController.deleteUmkm);

// Product CRUD
router.get('/produk', adminController.getAllProducts);
router.post('/produk', validate(productSchema), adminController.createProduct);
router.put('/produk/:id', validate(productUpdateSchema), adminController.updateProduct);
router.delete('/produk/:id', adminController.deleteProduct);

// Feedback List
router.get('/feedback', adminController.getFeedbacks);

module.exports = router;
