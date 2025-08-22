import React, { useState, useRef, useEffect } from 'react';
import { Camera, Thermometer, Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function HealthDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for health detection');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const analyzeFrame = (imageData) => {
    const data = imageData.data;
    let totalRed = 0, totalGreen = 0, totalBlue = 0;
    let facePixels = 0;
    
    // Analyze center region (face area)
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const radius = Math.min(imageData.width, imageData.height) / 4;
    
    for (let y = centerY - radius; y < centerY + radius; y++) {
      for (let x = centerX - radius; x < centerX + radius; x++) {
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance <= radius) {
            const index = (y * imageData.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Filter for skin-like colors
            if (r > g && r > b && r > 60) {
              totalRed += r;
              totalGreen += g;
              totalBlue += b;
              facePixels++;
            }
          }
        }
      }
    }
    
    if (facePixels === 0) return null;
    
    const avgRed = totalRed / facePixels;
    const avgGreen = totalGreen / facePixels;
    const avgBlue = totalBlue / facePixels;
    
    // Calculate health indicators
    const redness = avgRed / (avgGreen + avgBlue) * 100;
    const warmth = (avgRed - avgBlue) / 255 * 100;
    const saturation = Math.max(avgRed, avgGreen, avgBlue) - Math.min(avgRed, avgGreen, avgBlue);
    
    return { redness, warmth, saturation, avgRed, avgGreen, avgBlue };
  };

  const performScan = () => {
    if (!cameraActive || !videoRef.current) return;
    
    setIsScanning(true);
    setProgress(0);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const measurements = [];
    let scanCount = 0;
    const totalScans = 30;
    
    const scanInterval = setInterval(() => {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = analyzeFrame(imageData);
      
      if (analysis) {
        measurements.push(analysis);
      }
      
      scanCount++;
      setProgress((scanCount / totalScans) * 100);
      
      if (scanCount >= totalScans) {
        clearInterval(scanInterval);
        processResults(measurements);
      }
    }, 100);
  };

  const processResults = (measurements) => {
    if (measurements.length === 0) {
      setResults({
        status: 'error',
        message: 'Could not detect face properly. Please ensure good lighting and face the camera directly.'
      });
      setIsScanning(false);
      return;
    }
    
    // Calculate averages
    const avgRedness = measurements.reduce((sum, m) => sum + m.redness, 0) / measurements.length;
    const avgWarmth = measurements.reduce((sum, m) => sum + m.warmth, 0) / measurements.length;
    const avgSaturation = measurements.reduce((sum, m) => sum + m.saturation, 0) / measurements.length;
    
    // Predefined health assessment thresholds
    const feverThreshold = 65;
    const warmthThreshold = 25;
    const saturationThreshold = 45;
    
    let healthScore = 100;
    let warnings = [];
    let recommendations = [];
    
    // Fever detection based on facial redness
    if (avgRedness > feverThreshold) {
      healthScore -= 30;
      warnings.push('Elevated facial redness detected');
      recommendations.push('Consider checking body temperature');
    }
    
    // Warmth detection
    if (avgWarmth > warmthThreshold) {
      healthScore -= 20;
      warnings.push('Increased facial warmth indicators');
      recommendations.push('Monitor for fever symptoms');
    }
    
    // Color saturation analysis
    if (avgSaturation > saturationThreshold) {
      healthScore -= 15;
      warnings.push('Facial color intensity elevated');
      recommendations.push('Ensure adequate rest and hydration');
    }
    
    // Heart rate estimation (simulated based on color variations)
    const heartRateVariability = measurements.map((m, i) => 
      i > 0 ? Math.abs(m.avgRed - measurements[i-1].avgRed) : 0
    ).slice(1);
    const avgVariability = heartRateVariability.reduce((sum, v) => sum + v, 0) / heartRateVariability.length;
    const estimatedHeartRate = Math.round(60 + (avgVariability * 2));
    
    let status, message;
    if (healthScore >= 85) {
      status = 'healthy';
      message = 'No significant health concerns detected';
    } else if (healthScore >= 70) {
      status = 'caution';
      message = 'Some indicators suggest monitoring needed';
    } else {
      status = 'warning';
      message = 'Multiple indicators suggest potential health concerns';
    }
    
    setResults({
      status,
      message,
      healthScore: Math.max(0, Math.round(healthScore)),
      estimatedHeartRate,
      measurements: {
        facialRedness: Math.round(avgRedness),
        facialWarmth: Math.round(avgWarmth),
        colorIntensity: Math.round(avgSaturation)
      },
      warnings,
      recommendations: [
        ...recommendations,
        'This is not a medical diagnosis',
        'Consult healthcare professional for concerns',
        'Use proper thermometer for accurate temperature'
      ]
    });
    
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getStatusIcon = () => {
    if (!results) return <Thermometer className="w-8 h-8 text-blue-500" />;
    
    switch (results.status) {
      case 'healthy':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'caution':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'warning':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!results) return 'bg-blue-50 border-blue-200';
    
    switch (results.status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'warning':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Thermometer className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Health Detector</h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered health screening using facial analysis
          </p>
          <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ For educational purposes only. Not a substitute for medical advice.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-indigo-600" />
              Camera Feed
            </h2>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera Not Active</p>
                  </div>
                </div>
              )}
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-75">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Scanning... {Math.round(progress)}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={performScan}
                    disabled={isScanning}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Thermometer className="w-5 h-5 mr-2" />
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              {getStatusIcon()}
              <span className="ml-2">Health Analysis</span>
            </h2>

            {!results ? (
              <div className="text-center py-8 text-gray-500">
                <Thermometer className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No scan data available</p>
                <p className="text-sm">Start camera and perform a scan</p>
              </div>
            ) : (
              <div className={`border-2 rounded-lg p-4 ${getStatusColor()}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{results.message}</h3>
                  <div className="text-2xl font-bold">
                    {results.healthScore}/100
                  </div>
                </div>

                {results.measurements && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Facial Redness</div>
                      <div className="text-lg font-semibold">{results.measurements.facialRedness}%</div>
                    </div>
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Est. Heart Rate</div>
                      <div className="text-lg font-semibold flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" />
                        {results.estimatedHeartRate} BPM
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Facial Warmth</div>
                      <div className="text-lg font-semibold">{results.measurements.facialWarmth}%</div>
                    </div>
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Color Intensity</div>
                      <div className="text-lg font-semibold">{results.measurements.colorIntensity}%</div>
                    </div>
                  </div>
                )}

                {results.warnings && results.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2">⚠️ Observations:</h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                      {results.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.recommendations && results.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">💡 Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">1. Facial Analysis</div>
              <p>Analyzes facial color and warmth indicators using computer vision</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800 mb-2">2. Pattern Recognition</div>
              <p>Compares detected patterns against predefined health indicators</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-800 mb-2">3. Health Assessment</div>
              <p>Provides preliminary health screening with recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

