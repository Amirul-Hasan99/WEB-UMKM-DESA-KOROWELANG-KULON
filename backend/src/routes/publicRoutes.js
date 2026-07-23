const express = require('express');
const router = express.Router();
const {
  getUmkmList,
  getUmkmById,
  getDynamicContent,
  submitFeedback
} = require('../controllers/publicController');

router.get('/umkm', getUmkmList);
router.get('/umkm/:id', getUmkmById);
router.get('/konten', getDynamicContent);
router.post('/feedback', submitFeedback);

module.exports = router;
