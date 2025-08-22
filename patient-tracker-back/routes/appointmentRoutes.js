const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');


router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.scheduleAppointment);
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
// Add this route to your appointmentRoutes.js
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
// Get appointments by doctor
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);


module.exports = router;