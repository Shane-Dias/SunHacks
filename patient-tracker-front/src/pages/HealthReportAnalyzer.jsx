import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader, X, QrCode, Copy, Check } from 'lucide-react';

const HealthReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Generate shareable link and QR code after analysis
  useEffect(() => {
    if (analysis) {
      // Generate a unique shareable link (in real implementation, this would be stored on server)
      const reportId = Math.random().toString(36).substring(2, 15);
      const shareLink = `${window.location.origin}/shared-report/${reportId}`;
      setShareableLink(shareLink);
      
      // Generate QR code URL using QR Server API with better parameters
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&bgcolor=FFFFFF&color=000000&qzone=1&data=${encodeURIComponent(shareLink)}`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [analysis]);

  const handleFileChange = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'text/plain'];
    
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
      setAnalysis(null);
    } else {
      setError('Please select a valid file (PDF, DOC, DOCX, or TXT)');
      setFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('healthReport', file);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-health-report`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze the report');
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the report');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setAnalysis(null);
    setError('');
    setQrCodeUrl('');
    setShareableLink('');
    setLinkCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatAnalysis = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.includes('**') && line.includes('**')) {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '$1');
        return (
          <div key={index} className="text-lg font-semibold mt-6 mb-3 text-gray-900">
            {boldText}
          </div>
        );
      }
      if (line.trim().length > 0) {
        return (
          <div key={index} className="mb-3 text-gray-600 leading-relaxed">
            {line}
          </div>
        );
      }
      return <div key={index} className="mb-3"></div>;
    });
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
            AI Health Report{' '}
            <span className="text-blue-600">Analyzer</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Upload your health report to get AI-powered insights about potential future health risks and personalized recommendations using advanced medical analysis.
          </p>
        </div>

        {!analysis ? (
          <div className="max-w-4xl mx-auto">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <div className={`p-6 rounded-full mb-8 transition-colors ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-16 w-16 ${
                    dragActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Upload Your Health Report
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                  </label>
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">PDF</span>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">DOC</span>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">DOCX</span>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">TXT</span>
                </div>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            </div>

            {/* Selected File Info */}
            {file && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-green-900">{file.name}</p>
                      <p className="text-sm text-green-700">
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-red-900">Upload Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className={`px-8 py-4 rounded-md text-lg font-semibold shadow-sm transition-all duration-200 ${
                  !file || loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-6 w-6 mr-3" />
                    <span>Analyzing Your Report...</span>
                  </div>
                ) : (
                  <span>Analyze Health Report</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-12">
            {/* Success Header */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                Analysis Complete
              </h2>
              <p className="text-lg text-green-700">
                Successfully analyzed: <span className="font-medium">{analysis.filename}</span>
              </p>
            </div>

            {/* Analysis Results */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-8">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      AI Health Analysis
                    </h3>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed space-y-2">
                    {formatAnalysis(analysis.analysis)}
                  </div>
                </div>
              </div>
            </div>

            {/* Share QR Code Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-8">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <QrCode className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Share Your Report
                    </h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 inline-block mb-6 shadow-sm">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code for sharing report" 
                          className="w-48 h-48 mx-auto block"
                          onLoad={(e) => {
                            console.log('QR Code loaded successfully');
                          }}
                          onError={(e) => {
                            console.error('QR Code failed to load:', e);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                          <Loader className="animate-spin h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div 
                        style={{display: 'none'}} 
                        className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500 flex-col"
                      >
                        <QrCode className="h-12 w-12 mb-2" />
                        <span className="text-sm">QR Code Error</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan with your phone to share this report
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Shareable Link</h4>
                    <div className="flex items-center space-x-3 mb-6">
                      <input
                        type="text"
                        value={shareableLink}
                        readOnly
                        className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`p-3 rounded-md transition-all duration-200 ${
                          linkCopied 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {linkCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share this link with healthcare providers or family members to give them access to your analysis report.
                    </p>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        <strong>Privacy Note:</strong> This link will be active for 30 days. The report contains sensitive health information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-md p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3 mr-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-amber-900 mb-2">Important Medical Disclaimer</h4>
                    <p className="text-amber-800 leading-relaxed">
                      This AI analysis is for <strong>informational purposes only</strong> and should not replace 
                      professional medical advice, diagnosis, or treatment. Always consult with qualified 
                      healthcare providers for medical decisions and before making any changes to your health regimen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={resetForm}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-md font-semibold
                         hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                Analyze Another Report
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-600 text-white rounded-md font-semibold
                         hover:bg-gray-700 transition-colors duration-200"
              >
                Print Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthReportAnalyzer;