const express = require('express');
const router = express.Router();
const { exportUmkm, exportProducts, exportFeedback } = require('../controllers/exportController');

// NOTE: Auth is already applied at the router level in adminRoutes.js
// No need to apply authenticateToken again here.
// These routes are accessible via: GET /api/admin/export/umkm, etc.

router.get('/umkm', exportUmkm);
router.get('/produk', exportProducts);
router.get('/feedback', exportFeedback);

module.exports = router;
