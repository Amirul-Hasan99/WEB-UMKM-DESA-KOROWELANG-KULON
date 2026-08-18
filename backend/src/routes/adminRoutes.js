const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { loginSchema, profileSchema, umkmSchema, umkmUpdateSchema, productSchema, productUpdateSchema } = require('../validators/schemas');

const adminController = require('../controllers/adminController');
const uploadRoutes = require('./uploadRoutes');
const exportRoutes = require('./exportRoutes');

const { loginLimiter } = require('../middleware/rateLimiter');

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
router.get('/products', adminController.getAllProducts);
router.post('/products', validate(productSchema), adminController.createProduct);
router.put('/products/:id', validate(productUpdateSchema), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Feedback List & Management
router.get('/feedbacks', adminController.getFeedbacks);
router.delete('/feedbacks/:id', adminController.deleteFeedback);

module.exports = router;
