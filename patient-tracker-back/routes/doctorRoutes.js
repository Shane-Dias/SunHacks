const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken } = require('../jwt-middleware');

// Updated routes for role-based authentication
router.post('/register', doctorController.registerUser);
router.post('/login', doctorController.loginUser);
router.get('/patients/:doctorId', verifyToken, doctorController.getPatientDetailsForDoctor);
router.post('/patients/:doctorId', verifyToken, doctorController.addPatientForDoctor);

module.exports = router;