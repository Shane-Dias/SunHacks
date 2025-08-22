import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiFileText, FiUpload, FiList } from 'react-icons/fi';
import DocumentUpload from '../components/DocumentUpload';
import DocumentsList from '../components/DocumentsList';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  // Fetch patients for doctors
  useEffect(() => {
    if (role === 'doctor') {
      fetchPatients();
    }
  }, [role]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      } else {
        console.error('Failed to fetch patients:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('list');
  };

  // If user is a patient, use their patient record ID
  useEffect(() => {
    if (role === 'patient' && user?.patientRecord) {
      setSelectedPatientId(user.patientRecord);
    }
  }, [role, user]);

  if (role === 'patient' && !selectedPatientId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <FiFileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Record Not Found</h1>
            <p className="text-gray-600">Please contact your healthcare provider to set up your patient record.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Documents</h1>
          <p className="text-gray-600">
            Manage and share your medical documents securely with role-based access control
          </p>
        </div>

        {/* Patient Selection (for doctors) */}
        {role === 'doctor' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Patient</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : patients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient._id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedPatientId === patient._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">Patient ID: {patient._id}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">No patients found. Please add patients first.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiList className="inline mr-2" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUpload className="inline mr-2" />
                Upload New
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' && (
          <div>
            {!selectedPatientId ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FiFileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                <p className="text-gray-600 mb-4">
                  {role === 'doctor' 
                    ? 'Please select a patient to view their documents.'
                    : 'Please wait while we load your documents.'
                  }
                </p>
                {role === 'doctor' && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Upload Document
                  </button>
                )}
              </div>
            ) : (
              <DocumentsList 
                patientId={selectedPatientId} 
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            {!selectedPatientId ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FiFileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                <p className="text-gray-600 mb-4">
                  {role === 'doctor' 
                    ? 'Please select a patient first to upload documents.'
                    : 'Please wait while we load your patient record.'
                  }
                </p>
              </div>
            ) : (
              <DocumentUpload 
                patientId={selectedPatientId} 
                onUploadSuccess={handleUploadSuccess}
              />
            )}
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiFileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Storage</h3>
            <p className="text-gray-600 text-sm">
              All documents are encrypted and stored securely with role-based access control
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiUpload className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Sharing</h3>
            <p className="text-gray-600 text-sm">
              Generate QR codes for temporary access or share documents with specific users
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiList className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organized Management</h3>
            <p className="text-gray-600 text-sm">
              Categorize documents by type, add tags, and maintain detailed descriptions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
