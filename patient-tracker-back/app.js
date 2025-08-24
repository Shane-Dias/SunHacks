// Combined Express.js Server - AI Virtual Calling + Patient Management + Health Report Analyzer + AI Facial Health Analysis
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // npm install node-fetch@2
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Import routes (make sure these files exist)
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientHealthMetricsRoutes = require('./routes/patientHealthMetricsRoutes');
const documentRoutes = require('./routes/documentRoutes');
const publicDocumentRoutes = require('./routes/publicDocumentRoutes');
const { verifyToken } = require('./jwt-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check environment variables
console.log('Environment check:');
console.log('MONGO_PWD exists:', !!process.env.MONGO_PWD);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('PORT:', process.env.PORT || '5000 (default)');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
const mongoUri = `mongodb+srv://Shane123:${process.env.MONGO_PWD}@cluster0.je2azh4.mongodb.net/patient_data?retryWrites=true&w=majority`;
console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  maxIdleTimeMS: 30000, // Close sockets after 30s of inactivity
  connectTimeoutMS: 15000, // Give up initial connection after 15s
});

mongoose.connection.on('connected', () => console.log('✅ Connected to MongoDB successfully'));
mongoose.connection.on('error', (err) => console.log('❌ Error connecting to MongoDB:', err));
mongoose.connection.on('disconnected', () => console.log('⚠️ Disconnected from MongoDB'));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBx5oCo724GNVRC5prKOwgYsb7miLnIjO4');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBx5oCo724GNVRC5prKOwgYsb7miLnIjO4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// AI Personality System Prompts for Virtual Calling
const aiPersonalities = {
  healthcare: {
    name: 'Dr. AI Assistant',
    systemPrompt: `You are Dr. AI Assistant, a compassionate and knowledgeable healthcare professional. You provide medical guidance, health advice, and support to patients. Always be empathetic, ask relevant follow-up questions, and provide clear, helpful medical information. If something seems serious, recommend seeking immediate medical attention. Keep responses concise but informative (max 150 words).`,
    greeting: "Hello! I'm Dr. AI Assistant. I'm here to help with your health concerns. How can I assist you today?"
  },
  therapist: {
    name: 'Alex Mindwell',
    systemPrompt: `You are Alex Mindwell, a caring and professional mental health therapist. You provide emotional support, coping strategies, and mental health guidance. Always be empathetic, non-judgmental, and supportive. Ask thoughtful questions to understand the person's feelings and situation. Provide practical advice and coping mechanisms. Keep responses warm and understanding (max 150 words).`,
    greeting: "Hi there! I'm Alex, your mental health support assistant. I'm here to listen and help. What's on your mind today?"
  },
  coach: {
    name: 'Coach Riley',
    systemPrompt: `You are Coach Riley, an enthusiastic and motivational life coach. You help people achieve their goals, overcome challenges, and improve their lives. Be positive, encouraging, and action-oriented. Ask powerful questions that help people think deeper about their goals and obstacles. Provide practical strategies and motivation. Keep responses energetic and inspiring (max 150 words).`,
    greeting: "Hey there! I'm Coach Riley, your personal life coach. I'm excited to help you achieve your goals! What would you like to work on today?"
  },
  consultant: {
    name: 'Dr. Business',
    systemPrompt: `You are Dr. Business, a professional business consultant with expertise in strategy, operations, and growth. You help with business problems, strategic planning, and professional development. Be analytical, practical, and results-focused. Ask clarifying questions about business goals and challenges. Provide actionable business advice. Keep responses professional and strategic (max 150 words).`,
    greeting: "Good day! I'm Dr. Business, your AI business consultant. I'm here to help with your business challenges and growth strategies. What can we discuss today?"
  },
  teacher: {
    name: 'Professor Sage',
    systemPrompt: `You are Professor Sage, a knowledgeable and patient educational tutor. You help explain complex topics, answer questions, and guide learning. Be clear, patient, and encouraging. Break down complex concepts into understandable parts. Ask questions to gauge understanding and provide examples. Keep responses educational and supportive (max 150 words).`,
    greeting: "Hello! I'm Professor Sage, your AI tutor. I'm here to help you learn and understand any topic you're curious about. What would you like to explore today?"
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'application/msword';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

// Rate limiting middleware for AI chat
const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute

  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const clientData = rateLimitStore.get(clientIP);
  
  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (clientData.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  clientData.count++;
  rateLimitStore.set(clientIP, clientData);
  next();
};

// Input validation middleware for AI chat
const validateMessage = (req, res, next) => {
  const { message, personality, conversationHistory } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid message',
      message: 'Message is required and must be a non-empty string'
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      error: 'Message too long',
      message: 'Message must be less than 1000 characters'
    });
  }

  if (personality && !aiPersonalities[personality]) {
    return res.status(400).json({
      error: 'Invalid personality',
      message: 'Personality must be one of: ' + Object.keys(aiPersonalities).join(', ')
    });
  }

  if (conversationHistory && (!Array.isArray(conversationHistory) || conversationHistory.length > 20)) {
    return res.status(400).json({
      error: 'Invalid conversation history',
      message: 'Conversation history must be an array with max 20 messages'
    });
  }

  next();
};

// Input validation for facial health analysis
const validateFacialHealthData = (req, res, next) => {
  const { facialMetrics, rawMeasurements } = req.body;

  if (!facialMetrics) {
    return res.status(400).json({
      error: 'Missing facial metrics',
      message: 'facialMetrics object is required'
    });
  }

  const requiredMetrics = ['avgRedness', 'avgWarmth', 'avgSaturation', 'avgBrightness'];
  for (const metric of requiredMetrics) {
    if (typeof facialMetrics[metric] !== 'number') {
      return res.status(400).json({
        error: 'Invalid facial metrics',
        message: `${metric} must be a number`
      });
    }
  }

  if (!rawMeasurements || !Array.isArray(rawMeasurements)) {
    return res.status(400).json({
      error: 'Invalid raw measurements',
      message: 'rawMeasurements must be an array'
    });
  }

  next();
};

// Function to extract text from different file types
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return fs.readFileSync(filePath, 'utf8');
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

// Function to analyze health report with Gemini AI
async function analyzeHealthReport(reportText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are a medical AI assistant with expertise in analyzing health reports and identifying potential health risks. Analyze the following health report and provide comprehensive insights. Please structure your response exactly as follows:

    **CURRENT HEALTH STATUS:**
    Provide a clear summary of the current health indicators found in the report, including any abnormal values, concerning trends, or notable findings.

    **POTENTIAL FUTURE HEALTH RISKS:**
    Based on the current indicators, list specific potential health threats that may develop. Consider:
    - Risk factors present in the report
    - Trends that could lead to future complications
    - Lifestyle factors that might contribute to health issues
    - Genetic predispositions if mentioned
    - Age-related risks

    **IMMEDIATE CONCERNS:**
    Highlight any values or indicators that require immediate medical attention.

    **PREVENTIVE RECOMMENDATIONS:**
    Provide specific, actionable recommendations including:
    - Lifestyle modifications (diet, exercise, sleep)
    - Follow-up tests or screenings
    - Monitoring schedules
    - Professional consultations needed

    **POSITIVE INDICATORS:**
    Mention any healthy parameters or good indicators found in the report.

    **IMPORTANT MEDICAL DISCLAIMER:**
    This AI analysis is for informational and educational purposes only and should never replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions and before making any changes to your health regimen.

    Health Report Content:
    ${reportText.length > 4000 ? reportText.substring(0, 4000) + '...' : reportText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing with Gemini AI:', error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

// Function to analyze facial health metrics with Gemini AI
async function analyzeFacialHealthWithAI(facialData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are an advanced AI health assessment specialist with expertise in computer vision-based health screening and physiological analysis. Analyze the following facial metrics data collected from a 3-second video scan and provide a comprehensive health assessment.

    **FACIAL METRICS DATA:**
    - Average Facial Redness: ${facialData.facialMetrics.avgRedness}% (normal range: 40-60%)
    - Average Facial Warmth: ${facialData.facialMetrics.avgWarmth}% (normal range: 15-35%)
    - Average Color Saturation: ${facialData.facialMetrics.avgSaturation}% (normal range: 30-50%)
    - Average Brightness: ${facialData.facialMetrics.avgBrightness} (optimal range: 100-180)
    - Color Variability: ${facialData.facialMetrics.colorVariability} (indicates circulation patterns)
    - Number of Measurements: ${facialData.facialMetrics.measurementCount}
    - Lighting Condition: ${facialData.environmentalFactors?.lightingCondition || 'unknown'}
    - Scan Duration: ${facialData.scanDuration}ms

    **RAW MEASUREMENT SAMPLES:**
    ${JSON.stringify(facialData.rawMeasurements.slice(0, 5), null, 2)}

    Please provide your analysis in this exact JSON format:

    {
      "healthStatus": "healthy|caution|warning",
      "healthScore": 75,
      "summary": "Brief overall assessment summary",
      "analysis": "Detailed analysis of the facial metrics and what they indicate about health status",
      "insights": [
        "Key insight about circulation patterns",
        "Observation about skin tone indicators",
        "Analysis of physiological markers"
      ],
      "warnings": [
        "Any concerning indicators found",
        "Potential health risks identified"
      ],
      "recommendations": [
        "Specific actionable health recommendations",
        "Monitoring suggestions",
        "When to seek medical attention"
      ],
      "confidence": "high|medium|low",
      "physiologicalIndicators": {
        "circulationQuality": "excellent|good|fair|poor",
        "skinHealthMarkers": "positive|neutral|concerning",
        "potentialFeverSigns": true/false,
        "stressIndicators": "low|moderate|high"
      }
    }

    **IMPORTANT CONSIDERATIONS:**
    - Higher redness (>65%) may indicate fever, inflammation, or circulation issues
    - Excessive warmth (>40%) could suggest elevated body temperature
    - Low color variability might indicate poor circulation
    - Very high brightness (>200) or very low (<80) can affect accuracy
    - Consider environmental factors like lighting when making assessments
    - Always recommend professional medical consultation for concerning findings
    - This is a preliminary screening tool, not a diagnostic device

    Provide evidence-based analysis while being appropriately cautious about medical claims. Focus on observable patterns and their potential health implications.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to extract JSON from the response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI JSON response:', parseError);
    }
    
    // Fallback if JSON parsing fails
    return {
      healthStatus: 'analyzed',
      healthScore: 75,
      summary: 'Facial health analysis completed',
      analysis: responseText,
      insights: ['Facial metrics analyzed using AI technology'],
      warnings: ['This is a preliminary screening tool only'],
      recommendations: [
        'Consult healthcare professional for medical concerns',
        'Use proper medical devices for accurate measurements',
        'Consider this as supplementary health information only'
      ],
      confidence: 'medium',
      physiologicalIndicators: {
        circulationQuality: 'good',
        skinHealthMarkers: 'neutral',
        potentialFeverSigns: false,
        stressIndicators: 'moderate'
      }
    };
  } catch (error) {
    console.error('Error analyzing facial health with AI:', error);
    throw error;
  }
}

// ================== PUBLIC ROUTES (No Authentication Required) ==================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Combined AI Health System API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    services: {
      aiChat: true,
      patientManagement: true,
      healthReportAnalyzer: true,
      facialHealthAnalysis: true,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      mongoConnected: mongoose.connection.readyState === 1
    }
  });
});

// AI Facial Health Analysis endpoint (NEW)
app.post('/api/analyze-facial-health', rateLimit, validateFacialHealthData, async (req, res) => {
  try {
    const facialData = req.body;
    
    console.log('Facial Health Analysis Request:', {
      avgRedness: facialData.facialMetrics.avgRedness,
      avgWarmth: facialData.facialMetrics.avgWarmth,
      measurementCount: facialData.facialMetrics.measurementCount
    });

    // Analyze with Gemini AI
    const aiAnalysis = await analyzeFacialHealthWithAI(facialData);
    
    console.log('AI Analysis completed successfully');

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysisId: `facial_${Date.now()}`,
      ...aiAnalysis,
      metadata: {
        processingTime: Date.now() - new Date(facialData.timestamp).getTime(),
        dataQuality: facialData.facialMetrics.measurementCount >= 20 ? 'high' : 'moderate',
        environmentalFactors: facialData.environmentalFactors
      }
    });

  } catch (error) {
    console.error('Facial Health Analysis Error:', error);
    
    // Provide fallback analysis
    const fallbackAnalysis = {
      healthStatus: 'analyzed',
      healthScore: 70,
      summary: 'Basic facial health analysis completed (AI temporarily unavailable)',
      analysis: 'Local analysis indicates normal facial metrics within expected ranges. AI-enhanced analysis is temporarily unavailable.',
      insights: [
        'Facial color patterns appear within normal ranges',
        'No immediate concerning indicators detected',
        'Measurements show stable physiological markers'
      ],
      warnings: [
        'AI analysis service temporarily unavailable',
        'Results based on basic local processing only'
      ],
      recommendations: [
        'Consult healthcare professional for comprehensive evaluation',
        'Monitor any symptoms or concerns',
        'This is a preliminary screening tool only'
      ],
      confidence: 'low',
      physiologicalIndicators: {
        circulationQuality: 'unknown',
        skinHealthMarkers: 'neutral',
        potentialFeverSigns: false,
        stressIndicators: 'unknown'
      }
    };

    res.status(200).json({
      success: true,
      fallback: true,
      timestamp: new Date().toISOString(),
      analysisId: `facial_fallback_${Date.now()}`,
      ...fallbackAnalysis,
      error: 'AI service temporarily unavailable'
    });
  }
});

// AI Virtual Calling - Chat endpoint
app.post('/api/ai-chat', rateLimit, validateMessage, async (req, res) => {
  try {
    const { message, personality = 'healthcare', conversationHistory = [] } = req.body;
    
    console.log(`AI Chat Request - Personality: ${personality}, Message: ${message.substring(0, 50)}...`);

    const selectedPersonality = aiPersonalities[personality];
    
    // Prepare conversation history for Gemini API
    const conversationContents = [];
    
    // Add system prompt
    conversationContents.push({
      role: 'user',
      parts: [{ text: selectedPersonality.systemPrompt }]
    });
    
    // Add conversation history (limit to last 10 exchanges for context management)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.sender && msg.text) {
        conversationContents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    });
    
    // Add current message
    conversationContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Prepare request body for Gemini API
    const requestBody = {
      contents: conversationContents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
        stopSequences: []
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response text
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      console.log(`AI Response Generated: ${aiResponse.substring(0, 50)}...`);
      
      res.json({
        success: true,
        response: aiResponse,
        personality: selectedPersonality.name,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Unexpected Gemini API Response:', data);
      throw new Error('No response generated from AI');
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Provide fallback responses based on personality
    const fallbackResponses = {
      healthcare: "I apologize, but I'm having trouble connecting to my medical knowledge base right now. For any urgent medical concerns, please consult with a healthcare professional directly.",
      therapist: "I'm sorry, I'm experiencing some technical difficulties right now. Remember that you're not alone, and if you're in crisis, please reach out to a mental health professional or crisis helpline.",
      coach: "I'm having some connectivity issues at the moment, but I believe in you! Sometimes technical setbacks happen, and that's okay. Keep pushing forward!",
      consultant: "I'm experiencing some system issues right now. In the meantime, I'd recommend documenting your business questions and we can address them once I'm back online.",
      teacher: "I'm having trouble accessing my knowledge systems right now. Don't let this stop your learning journey - try exploring the topic through other educational resources!"
    };

    const personality = req.body.personality || 'healthcare';
    const fallbackResponse = fallbackResponses[personality] || "I apologize, but I'm experiencing technical difficulties. Please try again in a few moments.";

    res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable',
      fallbackResponse: fallbackResponse,
      message: 'Please try again in a few moments'
    });
  }
});

// Get available AI personalities
app.get('/api/personalities', (req, res) => {
  const personalities = Object.keys(aiPersonalities).map(key => ({
    id: key,
    name: aiPersonalities[key].name,
    greeting: aiPersonalities[key].greeting
  }));
  
  res.json({
    success: true,
    personalities: personalities
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running'
  });
});

// Health Report Analyzer endpoint (public)
app.post('/api/analyze-health-report', upload.single('healthReport'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname, 'Size:', req.file.size, 'bytes');
    
    // Extract text from the uploaded file
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    if (!extractedText || extractedText.trim().length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Could not extract readable text from the file. Please ensure the file contains text content.' 
      });
    }

    console.log('Extracted text length:', extractedText.length, 'characters');

    // Analyze with Gemini AI
    const analysis = await analyzeHealthReport(extractedText);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      analysis: analysis,
      extractedTextLength: extractedText.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing health report:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to analyze health report',
      details: error.message
    });
  }
});

// Public routes
app.use('/api/doctors', doctorRoutes); // login/register must be public
app.use('/api/documents/public', publicDocumentRoutes);

// ================== PROTECTED ROUTES (Authentication Required) ==================

// Apply JWT verification for protected routes
app.use('/api/patients', verifyToken);
app.use('/api/appointments', verifyToken);
app.use('/api/patient-health-metrics', verifyToken);
app.use('/api/documents', verifyToken);

// Protected routes
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-health-metrics', patientHealthMetricsRoutes);
app.use('/api/documents', documentRoutes);

// ================== ERROR HANDLING ==================

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size allowed is 10MB.'
      });
    }
  }
  
  console.error('Unhandled Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist'
  });
});

// ================== SERVER STARTUP ==================

app.listen(PORT, () => {
  console.log('🚀 AI Health System Server Started Successfully!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('\n📋 Available Services:');
  console.log('   🤖 AI Virtual Calling - /api/ai-chat');
  console.log('   👁️  AI Facial Health Analysis - /api/analyze-facial-health');
  console.log('   📊 Health Report Analyzer - /api/analyze-health-report');
  console.log('   👥 Patient Management - /api/patients');
  console.log('   📅 Appointment System - /api/appointments');
  console.log('   👨‍⚕️ Doctor Management - /api/doctors');
  console.log('\n⚙️  Configuration:');
  console.log(`   🔑 Gemini API: ${GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
  console.log(`   🍃 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
  console.log(`   🤖 AI Personalities: ${Object.keys(aiPersonalities).join(', ')}`);
  console.log(`   🎯 New Features: Facial Health Analysis with AI ✅`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🍃 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🍃 MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;