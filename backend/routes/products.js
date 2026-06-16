const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const multer = require('multer');
const path = require('path');

// Multer setup for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'hover_video', maxCount: 1 }
  ]), 
  productController.createProduct
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'hover_video', maxCount: 1 }
  ]), 
  productController.updateProduct
);

router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
