const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/schemas');
const { loginLimiter } = require('../middleware/rateLimiter');
const adminController = require('../controllers/adminController');

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), adminController.login);

module.exports = router;
