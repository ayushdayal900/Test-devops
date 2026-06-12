const express = require('express');
const router = express.Router();
const { getCloudinaryImages, getCloudinaryFolders, uploadImages } = require('../controllers/cloudinaryController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/images', protect, admin, getCloudinaryImages);
router.get('/folders', protect, admin, getCloudinaryFolders);
router.post('/upload', protect, admin, upload.array('images'), uploadImages);

module.exports = router;
