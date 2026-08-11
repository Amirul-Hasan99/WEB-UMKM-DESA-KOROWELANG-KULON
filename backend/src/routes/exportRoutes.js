const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { exportUmkms, exportProducts, exportFeedbacks } = require('../controllers/exportController');

router.use(authenticateToken);
router.use(requireRole('admin', 'superadmin'));

router.get('/umkm', exportUmkms);
router.get('/produk', exportProducts);
router.get('/feedback', exportFeedbacks);
=======
const { exportUmkm, exportProducts, exportFeedback } = require("../controllers/exportController");
const { authMiddleware, requireRole } = require("../../middleware/auth");

// All export routes require authentication + ADMIN/SUPERADMIN role
router.get("/umkm", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportUmkm);
router.get("/produk", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportProducts);
router.get("/feedback", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportFeedback);
>>>>>>> 6b68d9c5 (Migrasi backend ke MySQL Railway + Fix keamanan kritis + Deploy config)

module.exports = router;
