// routes/emailRoutes.js
import express from 'express';
import multer from 'multer';
import { getEmailLayout, uploadImage, uploadEmailConfig, renderAndDownloadTemplate } from '../controllers/emailController.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/getEmailLayout', getEmailLayout);
router.post('/uploadImage', upload.single('image'), uploadImage);
router.post('/uploadEmailConfig', uploadEmailConfig);
router.post('/renderAndDownloadTemplate', renderAndDownloadTemplate);

export default router;