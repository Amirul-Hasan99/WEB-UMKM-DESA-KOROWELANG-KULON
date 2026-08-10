const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { exportUmkms, exportProducts, exportFeedbacks } = require('../controllers/exportController');

router.use(authenticateToken);
router.use(requireRole('admin', 'superadmin'));

router.get('/umkm', exportUmkms);
router.get('/produk', exportProducts);
router.get('/feedback', exportFeedbacks);

module.exports = router;
