const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/profile', accountController.getProfile);
router.put('/profile', accountController.updateProfile);

router.get('/measurements', accountController.getMeasurements);
router.put('/measurements', accountController.updateMeasurements);

router.get('/wishlist', accountController.getWishlist);
router.post('/wishlist/:productId', accountController.addToWishlist);
router.delete('/wishlist/:productId', accountController.removeFromWishlist);

module.exports = router;
