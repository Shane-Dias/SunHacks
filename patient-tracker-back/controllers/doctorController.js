const Doctor = require('../models/doctor');
const Patient = require('../models/patients');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user (doctor or patient)
registerUser = async (req, res) => {
  try {
    const { username, email, password, role, ...userData } = req.body;

    // Check if user already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).send({ message: "User already exists" });
    }

    let newUser;
    
    if (role === 'doctor') {
      // Create doctor
      newUser = new Doctor({ username, email, password, role, ...userData });
      await newUser.save();
      
      const doctorData = newUser.toObject();
      delete doctorData.password;
      
      const token = jwt.sign({ _id: newUser._id, role: 'doctor' }, process.env.JWT_SECRET);
      
      res.status(201).send({ 
        message: "Doctor registered successfully",
        user: doctorData,
        token 
      });
      
    } else if (role === 'patient') {
      // Create patient user in Doctor collection (for authentication)
      const patientUser = new Doctor({ 
        username, 
        email, 
        password, 
        role: 'patient'
      });
      await patientUser.save();
      
      // Create patient record in Patient collection
      const patientRecord = new Patient({
        name: username,
        email: email,
        // Add other patient data from userData
        ...userData
      });
      await patientRecord.save();
      
      // Link patient record to user
      patientUser.patientRecord = patientRecord._id;
      await patientUser.save();
      
      const userDataResponse = patientUser.toObject();
      delete userDataResponse.password;
      
      const token = jwt.sign({ 
        _id: patientUser._id, 
        role: 'patient',
        patientRecordId: patientRecord._id 
      }, process.env.JWT_SECRET);
      
      res.status(201).send({ 
        message: "Patient registered successfully",
        user: userDataResponse,
        token 
      });
    } else {
      return res.status(400).send({ message: "Invalid role specified" });
    }
    
  } catch (error) {
    res.status(400).send(error);
  }
};

// Login user (doctor or patient)
loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Doctor.findOne({ email });
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    let tokenPayload = { _id: user._id, role: user.role };
    
    // Add patient record ID to token if user is a patient
    if (user.role === 'patient' && user.patientRecord) {
      tokenPayload.patientRecordId = user.patientRecord;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);
    
    const userData = user.toObject();
    delete userData.password;
    
    res.send({ user: userData, token });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get patient details for doctor
getPatientDetailsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify the requesting user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    // Fetch the doctor and populate the 'patients' array with full patient documents
    const patientsForDoctor = await Doctor.findById(doctorId).populate('patients');
    
    if (!patientsForDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (!patientsForDoctor.patients || patientsForDoctor.patients.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }
    
    res.status(200).json(patientsForDoctor.patients);
  } catch (error) {
    console.error('Error fetching doctor with patient details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add patient for doctor
addPatientForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patientData = req.body;

    // Verify the requesting user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    // Create a new patient
    const newPatient = new Patient(patientData);
    await newPatient.save();

    // Add the patient's ID to the doctor's patients array
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { patients: newPatient._id }
    });

    res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
  } catch (error) {
    console.error('Error adding patient to doctor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getPatientDetailsForDoctor, 
  addPatientForDoctor 
};