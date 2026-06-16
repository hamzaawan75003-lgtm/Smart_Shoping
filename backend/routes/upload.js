const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');
const streamifier = require('streamifier');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload-photo — upload a user photo to Cloudinary
// Returns { url: string }
router.post(
  '/upload-photo',
  authMiddleware,
  upload.single('photo'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'styleai/user-photos',
        transformation: [{ width: 800, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY UPLOAD]', error);
          return res.status(500).json({ error: 'Upload failed' });
        }
        res.json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  }
);

module.exports = router;
