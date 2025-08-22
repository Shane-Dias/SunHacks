const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../jwt-middleware');
const {
  uploadDocument,
  getPatientDocuments,
  downloadDocument,
  generateQRCode,
  shareDocument,
  deleteDocument,
  getDocumentStats
} = require('../controllers/documentController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'), false);
    }
  }
});

// Protected routes (require authentication)
router.use(verifyToken);

// Upload a new document
router.post('/upload', upload.single('document'), uploadDocument);

// Get documents for a specific patient
router.get('/patient/:patientId', getPatientDocuments);

// Download a specific document
router.get('/download/:documentId', downloadDocument);

// Generate QR code for document sharing
router.post('/:documentId/qr-code', generateQRCode);

// Share document with specific users
router.post('/:documentId/share', shareDocument);

// Delete a document
router.delete('/:documentId', deleteDocument);

// Get document statistics
router.get('/stats', getDocumentStats);

module.exports = router;
