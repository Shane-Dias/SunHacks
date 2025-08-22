const Document = require('../models/document');
const crypto = require('crypto');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Generate encryption key from environment variable or use a default
const getEncryptionKey = () => {
  return process.env.DOCUMENT_ENCRYPTION_KEY || 'your-secure-encryption-key-32-chars-long';
};

// Upload a new document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { patientId, documentType, description, tags, accessLevel } = req.body;
    const userId = req.user._id; // Changed from req.user.id to req.user._id

    // Validate required fields
    if (!patientId || !documentType) {
      return res.status(400).json({ error: 'Patient ID and document type are required' });
    }

    // Validate patientId format (should be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID format' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;

    // Read and encrypt the file
    const fileBuffer = req.file.buffer;
    const encryptionKey = getEncryptionKey();
    
    // Create document instance
    const document = new Document({
      filename: filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      patientId,
      uploadedBy: userId,
      documentType,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      accessLevel: accessLevel || 'private'
    });

    // Encrypt the document
    document.encryptDocument(fileBuffer, encryptionKey);
    
    // Save the document
    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        filename: document.filename,
        originalName: document.originalName,
        documentType: document.documentType,
        size: document.size,
        uploadedAt: document.createdAt
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get documents for a patient (with access control)
const getPatientDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find documents for the patient
    const documents = await Document.find({ 
      patientId, 
      isActive: true 
    }).populate('uploadedBy', 'username');

    // Filter documents based on access permissions
    const accessibleDocuments = documents.filter(doc => 
      doc.canAccess(userId, userRole)
    );

    // Return document metadata (not the encrypted content)
    const documentList = accessibleDocuments.map(doc => ({
      id: doc._id,
      originalName: doc.originalName,
      documentType: doc.documentType,
      description: doc.description,
      size: doc.size,
      tags: doc.tags,
      accessLevel: doc.accessLevel,
      uploadedBy: doc.uploadedBy.username,
      uploadedAt: doc.createdAt,
      hasQrCode: !!doc.qrCode && !doc.isQrCodeExpired
    }));

    res.json({ documents: documentList });

  } catch (error) {
    console.error('Error fetching patient documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Download a specific document
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    if (!document.canAccess(userId, userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Decrypt the document
    const encryptionKey = getEncryptionKey();
    const decryptedData = document.decryptDocument(encryptionKey);

    // Set response headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.size);

    // Send the decrypted document
    res.send(Buffer.from(decryptedData, 'utf8'));

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};

// Generate QR code for document sharing
const generateQRCode = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { durationHours = 24 } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document or has permission to share
    if (!document.canAccess(userId, req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate QR code access
    const qrAccess = document.generateQRAccess(parseInt(durationHours));
    await document.save();

    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrAccess.code);

    res.json({
      message: 'QR code generated successfully',
      qrCode: {
        dataURL: qrCodeDataURL,
        accessUrl: qrAccess.code,
        expiresAt: qrAccess.expiresAt,
        durationHours: parseInt(durationHours)
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Access document via QR code (public endpoint)
const accessDocumentViaQR = async (req, res) => {
  try {
    const { accessToken } = req.params;

    const document = await Document.findOne({
      'qrCode.accessToken': accessToken,
      'qrCode.expiresAt': { $gt: new Date() },
      isActive: true
    });

    if (!document) {
      return res.status(404).json({ error: 'Document access expired or invalid' });
    }

    // Return document metadata for viewing
    res.json({
      document: {
        id: document._id,
        originalName: document.originalName,
        documentType: document.documentType,
        description: document.description,
        size: document.size,
        uploadedAt: document.createdAt,
        expiresAt: document.qrCode.expiresAt
      },
      accessToken
    });

  } catch (error) {
    console.error('Error accessing document via QR:', error);
    res.status(500).json({ error: 'Failed to access document' });
  }
};

// Download document via QR code (public endpoint)
const downloadDocumentViaQR = async (req, res) => {
  try {
    const { accessToken } = req.params;

    const document = await Document.findOne({
      'qrCode.accessToken': accessToken,
      'qrCode.expiresAt': { $gt: new Date() },
      isActive: true
    });

    if (!document) {
      return res.status(404).json({ error: 'Document access expired or invalid' });
    }

    // Decrypt the document
    const encryptionKey = getEncryptionKey();
    const decryptedData = document.decryptDocument(encryptionKey);

    // Set response headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.size);

    // Send the decrypted document
    res.send(Buffer.from(decryptedData, 'utf8'));

  } catch (error) {
    console.error('Error downloading document via QR:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};

// Share document with specific users
const shareDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { userIds, accessUntil, accessLevel } = req.body;
    const currentUserId = req.user._id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (document.uploadedBy.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Only document owner can share' });
    }

    // Update sharing settings
    if (userIds && userIds.length > 0) {
      const sharedUsers = userIds.map(userId => ({
        userId,
        role: 'shared',
        accessUntil: accessUntil ? new Date(accessUntil) : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
      }));
      document.sharedWith = sharedUsers;
    }

    if (accessLevel) {
      document.accessLevel = accessLevel;
    }

    await document.save();

    res.json({
      message: 'Document shared successfully',
      sharedWith: document.sharedWith,
      accessLevel: document.accessLevel
    });

  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (document.uploadedBy.toString() !== userId) {
      return res.status(403).json({ error: 'Only document owner can delete' });
    }

    // Soft delete by setting isActive to false
    document.isActive = false;
    await document.save();

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// Get document statistics
const getDocumentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = { isActive: true };
    
    // If patient, only show their own documents
    if (userRole === 'patient') {
      query.patientId = req.user.patientRecord;
    }

    const totalDocuments = await Document.countDocuments(query);
    const totalSize = await Document.aggregate([
      { $match: query },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    const documentsByType = await Document.aggregate([
      { $match: query },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);

    res.json({
      totalDocuments,
      totalSize: totalSize[0]?.totalSize || 0,
      documentsByType
    });

  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
};

module.exports = {
  uploadDocument,
  getPatientDocuments,
  downloadDocument,
  generateQRCode,
  accessDocumentViaQR,
  downloadDocumentViaQR,
  shareDocument,
  deleteDocument,
  getDocumentStats
};
