const express = require('express');
const {
  accessDocumentViaQR,
  downloadDocumentViaQR
} = require('../controllers/documentController');

const router = express.Router();

// Public routes (no authentication required for QR code access)
router.get('/access/:accessToken', accessDocumentViaQR);
router.get('/download/:accessToken', downloadDocumentViaQR);

module.exports = router;
