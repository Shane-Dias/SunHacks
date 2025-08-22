const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const patientRoutes = require('./routes/patientRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientHealthMetricsRoutes = require('./routes/patientHealthMetricsRoutes');
const documentRoutes = require('./routes/documentRoutes');
const publicDocumentRoutes = require('./routes/publicDocumentRoutes');
const { verifyToken } = require('./jwt-middleware');

    
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Debug: Check environment variables
console.log('Environment check:');
console.log('MONGO_PWD exists:', !!process.env.MONGO_PWD);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT || '5000 (default)');

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

// Protected routes (require authentication)
app.use(verifyToken);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-health-metrics', patientHealthMetricsRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));