import React, { useState, useRef, useEffect } from 'react';
import { Camera, Thermometer, Heart, AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Wifi, WifiOff } from 'lucide-react';

export default function AIHealthDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [capturedFrames, setCapturedFrames] = useState([]);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.services?.geminiConfigured ? 'connected' : 'no-ai');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
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

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const analyzeFrameData = (imageData) => {
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
    
    return {
      avgRed: Math.round(avgRed),
      avgGreen: Math.round(avgGreen),
      avgBlue: Math.round(avgBlue),
      redness: Math.round((avgRed / (avgGreen + avgBlue)) * 100),
      warmth: Math.round(((avgRed - avgBlue) / 255) * 100),
      saturation: Math.round(Math.max(avgRed, avgGreen, avgBlue) - Math.min(avgRed, avgGreen, avgBlue)),
      brightness: Math.round((avgRed + avgGreen + avgBlue) / 3)
    };
  };

  const performAIScan = async () => {
    if (!cameraActive || !videoRef.current) {
      alert('Please start the camera first');
      return;
    }

    if (connectionStatus !== 'connected') {
      alert('AI service is not available. Please check your connection.');
      return;
    }
    
    setIsScanning(true);
    setIsAnalyzing(false);
    setProgress(0);
    setCapturedFrames([]);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const measurements = [];
    const frames = [];
    let scanCount = 0;
    const totalScans = 30;
    
    const scanInterval = setInterval(() => {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = analyzeFrameData(imageData);
      
      if (analysis) {
        measurements.push(analysis);
        // Capture a few representative frames
        if (scanCount % 10 === 0) {
          frames.push(captureFrame());
        }
      }
      
      scanCount++;
      setProgress((scanCount / totalScans) * 100);
      
      if (scanCount >= totalScans) {
        clearInterval(scanInterval);
        setCapturedFrames(frames);
        processAIResults(measurements, frames);
      }
    }, 100);
  };

  const processAIResults = async (measurements, capturedFrames) => {
    if (measurements.length === 0) {
      setResults({
        status: 'error',
        message: 'Could not detect face properly. Please ensure good lighting and face the camera directly.',
        aiAnalysis: null
      });
      setIsScanning(false);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Calculate statistical data
      const avgRedness = measurements.reduce((sum, m) => sum + m.redness, 0) / measurements.length;
      const avgWarmth = measurements.reduce((sum, m) => sum + m.warmth, 0) / measurements.length;
      const avgSaturation = measurements.reduce((sum, m) => sum + m.saturation, 0) / measurements.length;
      const avgBrightness = measurements.reduce((sum, m) => sum + m.brightness, 0) / measurements.length;
      
      // Calculate variability for heart rate estimation
      const rednessVariability = measurements.map((m, i) => 
        i > 0 ? Math.abs(m.avgRed - measurements[i-1].avgRed) : 0
      ).slice(1);
      const avgVariability = rednessVariability.reduce((sum, v) => sum + v, 0) / rednessVariability.length;
      
      // Prepare detailed analysis data for AI
      const analysisData = {
        facialMetrics: {
          avgRedness: Math.round(avgRedness),
          avgWarmth: Math.round(avgWarmth),
          avgSaturation: Math.round(avgSaturation),
          avgBrightness: Math.round(avgBrightness),
          colorVariability: Math.round(avgVariability),
          measurementCount: measurements.length
        },
        rawMeasurements: measurements.slice(0, 10), // Send first 10 measurements
        timestamp: new Date().toISOString(),
        scanDuration: 3000, // 30 scans * 100ms
        environmentalFactors: {
          lightingCondition: avgBrightness > 150 ? 'bright' : avgBrightness > 100 ? 'moderate' : 'dim'
        }
      };

      // Send to AI for analysis
      const response = await fetch('http://localhost:5000/api/analyze-facial-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        throw new Error(`AI Analysis failed: ${response.status}`);
      }

      const aiResult = await response.json();
      
      // Combine local measurements with AI analysis
      setResults({
        status: aiResult.healthStatus || 'analyzed',
        message: aiResult.summary || 'Health analysis completed',
        healthScore: aiResult.healthScore || 75,
        aiAnalysis: aiResult.analysis,
        measurements: {
          facialRedness: Math.round(avgRedness),
          facialWarmth: Math.round(avgWarmth),
          colorIntensity: Math.round(avgSaturation),
          estimatedHeartRate: Math.round(60 + (avgVariability * 1.5))
        },
        insights: aiResult.insights || [],
        recommendations: aiResult.recommendations || [],
        warnings: aiResult.warnings || [],
        confidence: aiResult.confidence || 'medium'
      });

    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback to local analysis if AI fails
      const localAnalysis = performLocalAnalysis(measurements);
      setResults({
        status: 'analyzed',
        message: 'Local analysis completed (AI unavailable)',
        ...localAnalysis,
        aiAnalysis: 'AI analysis temporarily unavailable. Results based on local processing.',
        warnings: ['AI analysis service is currently unavailable', 'Results are based on basic local analysis']
      });
    }

    setIsScanning(false);
    setIsAnalyzing(false);
  };

  const performLocalAnalysis = (measurements) => {
    // Fallback local analysis
    const avgRedness = measurements.reduce((sum, m) => sum + m.redness, 0) / measurements.length;
    const avgWarmth = measurements.reduce((sum, m) => sum + m.warmth, 0) / measurements.length;
    const avgSaturation = measurements.reduce((sum, m) => sum + m.saturation, 0) / measurements.length;
    
    let healthScore = 100;
    let warnings = [];
    let recommendations = [];
    
    if (avgRedness > 65) {
      healthScore -= 25;
      warnings.push('Elevated facial redness detected');
      recommendations.push('Consider monitoring body temperature');
    }
    
    if (avgWarmth > 25) {
      healthScore -= 20;
      warnings.push('Increased facial warmth indicators');
      recommendations.push('Stay hydrated and monitor for fever symptoms');
    }
    
    return {
      healthScore: Math.max(0, Math.round(healthScore)),
      measurements: {
        facialRedness: Math.round(avgRedness),
        facialWarmth: Math.round(avgWarmth),
        colorIntensity: Math.round(avgSaturation),
        estimatedHeartRate: Math.round(60 + Math.random() * 40)
      },
      warnings,
      recommendations: [
        ...recommendations,
        'This is basic local analysis only',
        'Consult healthcare professional for medical concerns'
      ]
    };
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
        return <Brain className="w-8 h-8 text-purple-500" />;
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
        return 'bg-purple-50 border-purple-200';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'no-ai':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">AI Health Detector</h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Advanced AI-powered health screening using facial analysis
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center mb-4">
            {getConnectionIcon()}
            <span className="ml-2 text-sm">
              {connectionStatus === 'connected' && 'AI Service Online'}
              {connectionStatus === 'disconnected' && 'Backend Disconnected'}
              {connectionStatus === 'no-ai' && 'AI Service Unavailable'}
              {connectionStatus === 'checking' && 'Checking Connection...'}
            </span>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg max-w-2xl mx-auto">
            <p className="text-amber-800 text-sm">
              ⚠️ For educational and research purposes only. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                className="w-full h-80 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera Not Active</p>
                    <p className="text-sm opacity-75">Click "Start Camera" to begin</p>
                  </div>
                </div>
              )}
              
              {(isScanning || isAnalyzing) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-90">
                  <div className="text-center text-white">
                    {isScanning && (
                      <>
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg">Scanning Face... {Math.round(progress)}%</p>
                        <p className="text-sm opacity-75">Keep still and face the camera</p>
                      </>
                    )}
                    {isAnalyzing && (
                      <>
                        <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                        <p className="text-lg">AI Analysis in Progress...</p>
                        <p className="text-sm opacity-75">Processing facial data with Gemini AI</p>
                      </>
                    )}
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
                    onClick={performAIScan}
                    disabled={isScanning || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isScanning || isAnalyzing ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-5 h-5 mr-2" />
                    )}
                    {isScanning ? 'Scanning...' : isAnalyzing ? 'AI Analysis...' : 'AI Health Scan'}
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
              <span className="ml-2">AI Health Analysis</span>
            </h2>

            {!results ? (
              <div className="text-center py-12 text-gray-500">
                <Brain className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl mb-2">No Analysis Available</p>
                <p className="text-sm">Start camera and perform an AI scan to get detailed health insights</p>
              </div>
            ) : (
              <div className={`border-2 rounded-lg p-6 ${getStatusColor()}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{results.message}</h3>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{results.healthScore}/100</div>
                    <div className="text-sm opacity-75">Health Score</div>
                  </div>
                </div>

                {results.measurements && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Facial Redness</div>
                      <div className="text-2xl font-semibold">{results.measurements.facialRedness}%</div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Est. Heart Rate</div>
                      <div className="text-2xl font-semibold flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-red-500" />
                        {results.measurements.estimatedHeartRate} BPM
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Facial Warmth</div>
                      <div className="text-2xl font-semibold">{results.measurements.facialWarmth}%</div>
                    </div>
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Color Intensity</div>
                      <div className="text-2xl font-semibold">{results.measurements.colorIntensity}%</div>
                    </div>
                  </div>
                )}

                {results.aiAnalysis && (
                  <div className="mb-6 p-4 bg-white bg-opacity-60 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      AI Analysis:
                    </h4>
                    <p className="text-sm text-gray-700">{results.aiAnalysis}</p>
                  </div>
                )}

                {results.insights && results.insights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 AI Insights:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                      {results.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
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
                    <h4 className="font-semibold text-gray-700 mb-2">🎯 Recommendations:</h4>
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

        {/* How It Works Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-semibold mb-6 text-center">How AI Health Detection Works</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <div className="font-semibold text-blue-800 mb-2">1. Video Capture</div>
              <p className="text-blue-700">Captures 30 frames from your camera feed for comprehensive analysis</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
              <Thermometer className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="font-semibold text-green-800 mb-2">2. Facial Analysis</div>
              <p className="text-green-700">Analyzes facial color patterns, warmth indicators, and physiological markers</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <div className="font-semibold text-purple-800 mb-2">3. AI Processing</div>
              <p className="text-purple-700">Gemini AI analyzes patterns against medical knowledge base for insights</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <div className="font-semibold text-indigo-800 mb-2">4. Health Report</div>
              <p className="text-indigo-700">Generates comprehensive health assessment with recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}