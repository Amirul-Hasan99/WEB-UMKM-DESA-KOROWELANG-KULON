const express = require("express");
const router = express.Router();
const { exportUmkm, exportProducts, exportFeedback } = require("../controllers/exportController");
const { authMiddleware, requireRole } = require("../../middleware/auth");

// All export routes require authentication + ADMIN/SUPERADMIN role
router.get("/umkm", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportUmkm);
router.get("/produk", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportProducts);
router.get("/feedback", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), exportFeedback);

module.exports = router;
