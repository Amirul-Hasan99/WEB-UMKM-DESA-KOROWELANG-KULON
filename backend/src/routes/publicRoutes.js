const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { feedbackSchema, reviewSchema } = require('../validators/schemas');
const {
  getUmkms,
  getUmkmById,
  submitFeedback,
  getDynamicContent,
  submitReview
} = require('../controllers/publicController');

const { publicFormLimiter } = require('../middleware/rateLimiter');

router.get('/umkm', getUmkms);
router.get('/umkm/:id', getUmkmById);
router.get('/konten', getDynamicContent);
router.post('/feedback', publicFormLimiter, validate(feedbackSchema), submitFeedback);
router.post('/umkm/:id/review', publicFormLimiter, validate(reviewSchema), submitReview);

module.exports = router;
