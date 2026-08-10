const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { adminAccountSchema, adminAccountUpdateSchema, dynamicContentSchema } = require('../validators/schemas');

const superadminController = require('../controllers/superadminController');

router.use(authenticateToken);
router.use(requireRole('superadmin'));

// Admin account management
router.get('/admins', superadminController.getAllAdmins);
router.post('/admins', validate(adminAccountSchema), superadminController.createAdmin);
router.put('/admins/:id', validate(adminAccountUpdateSchema), superadminController.updateAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);

// Dynamic content
router.put('/konten', validate(dynamicContentSchema), superadminController.updateDynamicContent);

module.exports = router;
