const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

router.get('/public', reviewController.getAllReviews);
router.get('/provider/:providerId', reviewController.getProviderReviews);

router.post('/', authenticateToken, reviewController.createReview);

module.exports = router;
