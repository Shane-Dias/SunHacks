import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiFile, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';

const DocumentAccess = () => {
  const { accessToken } = useParams();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocumentInfo();
  }, [accessToken]);

  const fetchDocumentInfo = async () => {
    try {
      console.log('Fetching document info for access token:', accessToken);
      const response = await fetch(`/api/documents/public/access/${accessToken}`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Document data received:', data);
        setDocumentData(data.document);
      } else if (response.status === 404) {
        setError('Document not found or QR code has expired. Please request a new QR code.');
      } else if (response.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          setError(errorData.error || 'Document access failed');
        } catch (parseError) {
          setError(`Access failed with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to access document: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading document for access token:', accessToken);
      const response = await fetch(`/api/documents/public/download/${accessToken}`);
      
      console.log('Download response status:', response.status);
      console.log('Download response headers:', response.headers);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob received, size:', blob.size);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentData.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download completed successfully');
      } else if (response.status === 404) {
        setError('Document not found or QR code has expired. Please request a new QR code.');
      } else if (response.status === 500) {
        setError('Server error during download. Please try again later.');
      } else {
        try {
          const errorText = await response.text();
          console.error('Download failed:', response.status, errorText);
          setError('Download failed: ' + response.status);
        } catch (parseError) {
          setError(`Download failed with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error during download. Please check your connection and try again.');
      } else {
        setError('Failed to download document: ' + error.message);
      }
    }
  };

  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case 'medical_record':
        return <FiFile className="h-12 w-12 text-blue-500" />;
      case 'lab_result':
        return <FiFile className="h-12 w-12 text-green-500" />;
      case 'prescription':
        return <FiFile className="h-12 w-12 text-purple-500" />;
      case 'imaging':
        return <FiFile className="h-12 w-12 text-orange-500" />;
      default:
        return <FiFile className="h-12 w-12 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-6">The requested document could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Access</h1>
          <p className="text-gray-600">Secure access to medical document via QR code</p>
        </div>

        {/* Document Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            {getDocumentIcon(documentData.documentType)}
            <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              {documentData.originalName}
            </h2>
            <p className="text-gray-600 capitalize">
              {documentData.documentType.replace('_', ' ')}
            </p>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiFile className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">File Size</p>
                <p className="text-sm text-gray-600">{formatFileSize(documentData.size)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Uploaded</p>
                <p className="text-sm text-gray-600">{formatDate(documentData.uploadedAt)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {documentData.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {documentData.description}
              </p>
            </div>
          )}

          {/* Expiration Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <FiClock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Access Expires</p>
                <p className="text-sm text-yellow-700">
                  This document access will expire on {formatDate(documentData.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FiDownload className="h-5 w-5" />
              <span>Download Document</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <p className="text-sm text-blue-700 mt-1">
                This document is accessed through a secure, time-limited QR code. 
                The access will automatically expire for security purposes. 
                Please ensure you download the document before the access expires.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentAccess;
