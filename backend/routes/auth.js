const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});
router.get('/me', authMiddleware, authController.getMe);
router.put('/mode', authMiddleware, authController.updateMode);

module.exports = router;
