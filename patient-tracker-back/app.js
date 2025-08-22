require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Import routes
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
    : ['http://localhost:3000', 'http://localhost:5173']
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

// Public routes (no authentication required)
app.use('/api/doctors', doctorRoutes); // login/register must be public
app.use('/api/documents/public', publicDocumentRoutes);

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Combined Patient Management & Health Report Analyzer API is running!',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Protected routes (require authentication)
app.use(verifyToken);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-health-metrics', patientHealthMetricsRoutes);
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size allowed is 10MB.'
      });
    }
  }
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🍃 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;