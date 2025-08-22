const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  documentType: {
    type: String,
    enum: ['medical_record', 'lab_result', 'prescription', 'imaging', 'other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  accessLevel: {
    type: String,
    enum: ['private', 'doctor_only', 'shared'],
    default: 'private'
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    role: String,
    accessUntil: Date
  }],
  qrCode: {
    code: String,
    expiresAt: Date,
    accessToken: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
documentSchema.index({ patientId: 1, uploadedBy: 1 });
documentSchema.index({ 'qrCode.accessToken': 1 });
documentSchema.index({ 'qrCode.expiresAt': 1 });

// Virtual for checking if QR code is expired
documentSchema.virtual('isQrCodeExpired').get(function() {
  if (!this.qrCode || !this.qrCode.expiresAt) return true;
  return new Date() > this.qrCode.expiresAt;
});

// Method to encrypt document data
documentSchema.methods.encryptDocument = function(buffer, secretKey) {
  const iv = crypto.randomBytes(16);
  // Use createCipheriv instead of deprecated createCipher
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf8'), iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  this.iv = iv.toString('hex');
  this.encryptedData = encrypted.toString('hex');
  return this;
};

// Method to decrypt document data
documentSchema.methods.decryptDocument = function(secretKey) {
  // Use createDecipheriv instead of deprecated createDecipher
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf8'), Buffer.from(this.iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(this.encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
};

// Method to generate QR code access
documentSchema.methods.generateQRAccess = function(durationHours = 24) {
  const accessToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + (durationHours * 60 * 60 * 1000));
  
  this.qrCode = {
    code: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/document-access/${accessToken}`,
    expiresAt: expiresAt,
    accessToken: accessToken
  };
  
  return this.qrCode;
};

// Method to check access permissions
documentSchema.methods.canAccess = function(userId, userRole) {
  // Owner can always access
  if (this.uploadedBy.toString() === userId.toString()) return true;
  
  // Check if user is shared with
  const sharedAccess = this.sharedWith.find(share => 
    share.userId.toString() === userId.toString() && 
    share.accessUntil > new Date()
  );
  if (sharedAccess) return true;
  
  // Doctors can access if document is shared or doctor_only
  if (userRole === 'doctor' && 
      (this.accessLevel === 'doctor_only' || this.accessLevel === 'shared')) {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Document', documentSchema);
