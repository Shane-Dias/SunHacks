# Medical Document Management System

## Overview

The Medical Document Management System is a comprehensive solution for securely storing, managing, and sharing medical documents with advanced security features including encryption, role-based access control, and QR code sharing.

## Features

### 🔐 **Security & Encryption**
- **AES-256 Encryption**: All documents are encrypted before storage
- **Role-based Access Control**: Different access levels for patients, doctors, and shared users
- **Secure File Upload**: File validation and size limits (10MB max)
- **JWT Authentication**: Secure API access with token-based authentication

### 📁 **Document Management**
- **Multiple File Formats**: Support for PDF, DOC, XLS, TXT, and image files
- **Document Categorization**: Medical records, lab results, prescriptions, imaging, and more
- **Metadata Management**: Tags, descriptions, and access level settings
- **Soft Delete**: Documents are marked as inactive rather than permanently deleted

### 🔗 **Sharing & Access Control**
- **QR Code Generation**: Create time-limited access codes for document sharing
- **Temporary Access**: Set expiration times (default: 24 hours)
- **User-specific Sharing**: Share documents with specific users with time limits
- **Access Levels**: Private, Doctor-only, and Shared access modes

### 👥 **Role-based Features**
- **Patients**: Can upload, view, and manage their own documents
- **Doctors**: Can access patient documents based on permissions and upload documents for patients
- **Shared Access**: Temporary access for specific users with expiration

## Technical Architecture

### Backend (Node.js + Express)
- **Document Model**: MongoDB schema with encryption methods
- **File Upload**: Multer middleware for handling file uploads
- **Encryption**: Crypto module for AES-256 encryption/decryption
- **QR Generation**: QRCode library for generating shareable codes
- **Access Control**: Middleware for role-based permissions

### Frontend (React + Tailwind CSS)
- **Document Upload**: Drag-and-drop interface with file validation
- **Document List**: Organized view with search and filtering
- **QR Code Display**: Modal for viewing generated QR codes
- **Sharing Interface**: User-friendly sharing controls
- **Responsive Design**: Mobile-friendly interface

## API Endpoints

### Protected Routes (Require Authentication)
```
POST   /api/documents/upload              - Upload new document
GET    /api/documents/patient/:patientId  - Get patient documents
GET    /api/documents/download/:id        - Download document
POST   /api/documents/:id/qr-code         - Generate QR code
POST   /api/documents/:id/share           - Share document
DELETE /api/documents/:id                 - Delete document
GET    /api/documents/stats               - Get document statistics
```

### Public Routes (No Authentication Required)
```
GET    /api/documents/public/access/:token    - Access document via QR code
GET    /api/documents/public/download/:token  - Download document via QR code
```

## Installation & Setup

### Backend Dependencies
```bash
npm install multer crypto qrcode uuid express-rate-limit
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
# MongoDB Connection
MONGO_PWD=your_mongodb_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Document Encryption Key (32 characters for AES-256)
DOCUMENT_ENCRYPTION_KEY=your-secure-encryption-key-32-chars-long

# Frontend URL for QR Code Generation
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

### Frontend Dependencies
The required packages are already included in the project:
- React Icons for UI icons
- React Toastify for notifications
- Axios for API calls

## Usage Guide

### 1. Uploading Documents
1. Navigate to the Documents page
2. Select a patient (for doctors) or use your own record (for patients)
3. Click "Upload New" tab
4. Drag and drop or select a file
5. Fill in document details (type, description, tags, access level)
6. Click "Upload Document"

### 2. Managing Documents
1. View all documents in the Documents tab
2. Use action buttons for each document:
   - **Download**: Save document to local device
   - **QR Code**: Generate shareable QR code
   - **Share**: Share with specific users
   - **Delete**: Remove document (owners only)

### 3. Sharing via QR Code
1. Click the QR Code button on any document
2. Set expiration time (default: 24 hours)
3. Share the generated QR code or access link
4. Recipients can scan QR code or use link to access document

### 4. Access Control
- **Private**: Only document owner can access
- **Doctor Only**: All doctors can access
- **Shared**: Specific users with time limits

## Security Features

### Encryption
- Documents are encrypted using AES-256-CBC
- Each document has a unique initialization vector (IV)
- Encryption key is stored in environment variables

### Access Control
- JWT tokens for API authentication
- Role-based permissions (patient/doctor)
- Time-limited sharing with QR codes
- User-specific access grants

### File Validation
- File type restrictions
- Size limits (10MB maximum)
- MIME type validation
- Secure file handling

## File Format Support

### Supported Document Types
- **PDF**: Medical reports, forms
- **Word Documents**: Letters, notes
- **Excel Files**: Data sheets, reports
- **Text Files**: Simple notes, logs
- **Images**: Scans, photos, diagrams

### File Size Limits
- Maximum file size: 10MB
- Optimized for medical document storage
- Efficient handling of large files

## QR Code Sharing

### Features
- **Time-limited Access**: Set expiration times
- **Secure Tokens**: Random 32-character access tokens
- **Public Access**: No authentication required for QR access
- **Automatic Expiration**: Access expires automatically

### Usage
1. Generate QR code for document
2. Share QR code image or access link
3. Recipients scan or click link
4. Access document before expiration
5. Automatic cleanup after expiration

## Error Handling

### Common Issues
- **File Too Large**: Check 10MB limit
- **Invalid File Type**: Ensure file format is supported
- **Access Denied**: Check user permissions and role
- **QR Code Expired**: Generate new QR code

### Troubleshooting
- Verify environment variables are set
- Check MongoDB connection
- Ensure encryption key is 32 characters
- Verify file upload permissions

## Performance Considerations

### Optimization
- File size limits prevent storage issues
- Efficient encryption/decryption
- Database indexing for fast queries
- Soft delete for data recovery

### Scalability
- Modular architecture
- Environment-based configuration
- Efficient file handling
- Database optimization

## Future Enhancements

### Planned Features
- **Document Versioning**: Track document changes
- **Advanced Search**: Full-text search capabilities
- **Bulk Operations**: Multiple document management
- **Audit Logging**: Track access and modifications
- **Cloud Storage**: Integration with cloud providers
- **Mobile App**: Native mobile application

### Integration Possibilities
- **EHR Systems**: Electronic Health Record integration
- **Lab Systems**: Direct lab result import
- **Imaging Systems**: Medical imaging integration
- **Telemedicine**: Remote consultation support

## Support & Maintenance

### Regular Tasks
- Monitor encryption key security
- Review access logs
- Update file type support
- Performance monitoring
- Security audits

### Best Practices
- Regular encryption key rotation
- Monitor file storage usage
- Regular security updates
- User access review
- Backup and recovery testing

## Conclusion

The Medical Document Management System provides a secure, efficient, and user-friendly solution for managing medical documents. With its advanced security features, role-based access control, and QR code sharing capabilities, it meets the needs of modern healthcare organizations while maintaining strict privacy and security standards.

For technical support or feature requests, please contact the development team.
