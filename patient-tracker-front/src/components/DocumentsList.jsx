import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiFile, FiDownload, FiShare2, FiTrash2, FiCalendar, FiTag, FiUser, 
  FiMaximize2, FiQrCode, FiUsers, FiClock, FiShield, FiCheckCircle
} from 'react-icons/fi';

const DocumentsList = ({ patientId, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [shareForm, setShareForm] = useState({
    selectedUserIds: [],
    accessUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to 24 hours from now
    accessLevel: 'private'
  });

  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  useEffect(() => {
    fetchDocuments();
    if (role === 'doctor') {
      fetchAvailableUsers();
    }
  }, [patientId, refreshTrigger, role]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out the current user and only show doctors
        const otherDoctors = data.doctors?.filter(doc => 
          doc._id !== user._id && doc.role === 'doctor'
        ) || [];
        setAvailableUsers(otherDoctors);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await fetch(`/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Document downloaded successfully');
      } else {
        toast.error('Failed to download document');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleGenerateQR = async (documentId, durationHours = 24) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/qr-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ durationHours })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeData(data.qrCode);
        setShowQRModal(true);
        toast.success('QR code generated successfully');
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleShare = async (documentId) => {
    try {
      // Convert selectedUserIds array to the format expected by the backend
      const shareData = {
        userIds: shareForm.selectedUserIds,
        accessUntil: shareForm.accessUntil,
        accessLevel: shareForm.accessLevel
      };

      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shareData)
      });

      if (response.ok) {
        toast.success('Document shared successfully');
        setShowShareModal(false);
        setShareForm({ 
          selectedUserIds: [], 
          accessUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), 
          accessLevel: 'private' 
        });
        fetchDocuments();
      } else {
        toast.error('Failed to share document');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case 'medical_record':
        return <FiFile className="h-6 w-6 text-blue-500" />;
      case 'lab_result':
        return <FiFile className="h-6 w-6 text-green-500" />;
      case 'prescription':
        return <FiFile className="h-6 w-6 text-purple-500" />;
      case 'imaging':
        return <FiFile className="h-6 w-6 text-orange-500" />;
      default:
        return <FiFile className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAccessLevelIcon = (accessLevel) => {
    switch (accessLevel) {
      case 'private':
        return <FiShield className="h-4 w-4 text-red-500" />;
      case 'doctor_only':
        return <FiShield className="h-4 w-4 text-yellow-500" />;
      case 'shared':
        return <FiShield className="h-4 w-4 text-green-500" />;
      default:
        return <FiShield className="h-4 w-4 text-gray-500" />;
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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiFile className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>No documents uploaded yet.</p>
        <p className="text-sm">Upload your first medical document to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Documents List */}
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getDocumentIcon(doc.documentType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {doc.originalName}
                  </h4>
                  {getAccessLevelIcon(doc.accessLevel)}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center">
                    <FiTag className="mr-1" />
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" />
                    {formatDate(doc.uploadedAt)}
                  </span>
                  <span>{formatFileSize(doc.size)}</span>
                  <span className="flex items-center">
                    <FiUser className="mr-1" />
                    {doc.uploadedBy}
                  </span>
                </div>

                {doc.description && (
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {doc.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleDownload(doc.id, doc.originalName)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                title="Download"
              >
                <FiDownload className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleGenerateQR(doc.id)}
                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors"
                title="Generate QR Code"
              >
                <FiQrCode className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  setShowShareModal(true);
                }}
                className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-md transition-colors"
                title="Share"
              >
                <FiShare2 className="h-4 w-4" />
              </button>

              {doc.uploadedBy === user?.username && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">QR Code Generated</h3>
            <div className="text-center">
              <img
                src={qrCodeData.dataURL}
                alt="QR Code"
                className="mx-auto mb-4 border border-gray-200"
              />
              <p className="text-sm text-gray-600 mb-2">
                This QR code will expire in {qrCodeData.durationHours} hours
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Expires: {new Date(qrCodeData.expiresAt).toLocaleString()}
              </p>
              <a
                href={qrCodeData.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View Access Link
              </a>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users to Share With
                </label>
                {availableUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableUsers.map((user) => (
                      <span
                        key={user._id}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          shareForm.selectedUserIds.includes(user._id)
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        onClick={() => {
                          const newSelectedUserIds = [...shareForm.selectedUserIds];
                          if (newSelectedUserIds.includes(user._id)) {
                            newSelectedUserIds.splice(newSelectedUserIds.indexOf(user._id), 1);
                          } else {
                            newSelectedUserIds.push(user._id);
                          }
                          setShareForm({ ...shareForm, selectedUserIds: newSelectedUserIds });
                        }}
                      >
                        <FiUsers className="mr-1" />
                        {user.username}
                        {shareForm.selectedUserIds.includes(user._id) && (
                          <FiCheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                    <FiUsers className="inline mr-2" />
                    No other doctors available to share with at the moment.
                  </div>
                )}
                {shareForm.selectedUserIds.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Selected: {shareForm.selectedUserIds.length} user(s)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Until
                </label>
                <input
                  type="datetime-local"
                  value={shareForm.accessUntil}
                  onChange={(e) => setShareForm({ ...shareForm, accessUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <select
                  value={shareForm.accessLevel}
                  onChange={(e) => setShareForm({ ...shareForm, accessLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="private">Private</option>
                  <option value="doctor_only">Doctors Only</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleShare(selectedDocument.id)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
