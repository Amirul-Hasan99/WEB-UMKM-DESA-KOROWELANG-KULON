const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateDynamicContent
} = require('../controllers/superadminController');

// Super Admin Protected Routes (Strictly superadmin only)
router.use(authenticateToken);
router.use(requireRole('superadmin'));

// Manage Staff Admin Accounts
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Dynamic Website Content Management
router.put('/konten', updateDynamicContent);

module.exports = router;
