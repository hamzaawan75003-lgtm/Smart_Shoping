const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

router.get('/:productId', reviewController.getProductReviews);

router.use(authMiddleware);
router.post('/', reviewController.createReview);

module.exports = router;
