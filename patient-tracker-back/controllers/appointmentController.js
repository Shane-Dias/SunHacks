const Appointment = require('../models/appointment'); // Adjust path as necessary
const sendMail = require('../services/nodemailer'); // Adjust the path as needed
const Doctor = require('../models/doctor');
const Patient = require('../models/patients');

getAllAppointments = async (req, res) => {
  try {
      const appointments = await Appointment.find();
      res.json(appointments);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

getAppointmentById = async (req, res) => {
  const { id } = req.params; // Get the appointment ID from the request parameters

  try {
    const appointment = await Appointment.findById(id);

    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


scheduleAppointment = async (req, res) => {
  const appointment = new Appointment({
    patient: req.body.patient,
    date: req.body.date,
    purpose: req.body.purpose,
    doctor: req.body.doctor
  });

  try {
    const newAppointment = await appointment.save();

    // Populate doctor and patient to get their emails
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate('doctor', 'email username')
      .populate('patient', 'email username')
      .exec();

    // Prepare email details
    const doctorEmail = populatedAppointment.doctor.email;
    const doctorName = populatedAppointment.doctor.username;
    const patientEmail = populatedAppointment.patient.email;
    const patientName = populatedAppointment.patient.username;

    // Compose subject and message
    // const subject = `New Appointment Scheduled with Dr. ${doctorName}`;
    // const message = `
    //   <p>Dear ${patientName},</p>
    //   <p>Your appointment has been scheduled with Dr. ${doctorName}.</p>
    //   <p><strong>Date:</strong> ${populatedAppointment.date}</p>
    //   <p><strong>Purpose:</strong> ${populatedAppointment.purpose}</p>
    //   <p>Thank you for using HealthLock.</p>
    // `;

    // // Send email from doctor to patient
    // await sendMail(doctorEmail, patientEmail, subject, message);

    res.status(201).json(newAppointment);
  } catch (err) {
    console.error('Error scheduling appointment or sending email:', err);
    res.status(400).json({ message: err.message });
  }
};

getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointmentsWithPatients = await Appointment.find({ doctor: doctorId })
    .populate('patient', 'name dateOfBirth contact') // Adjust fields as per requirement
    .exec();

    res.status(200).json(appointmentsWithPatients);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
}

updateAppointment = async (req, res) => {
  const { id } = req.params; 

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(id);

    if (appointment) {
      if (req.body.patient) appointment.patient = req.body.patient;
      if (req.body.date) appointment.date = req.body.date;
      if (req.body.purpose) appointment.purpose = req.body.purpose;
      if (req.body.doctor) appointment.doctor = req.body.doctor;

      // Save the updated appointment
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add this to your appointmentController.js
getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching appointments for patient:', patientId);

    const appointments = await Appointment.find({ patient: patientId })
      .populate('patient', 'username contact') // <-- populate patient details
      .populate('doctor', 'username email name contact') // optional: also populate doctor if needed
      .exec();

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointmentsWithPatients = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'username contact') // <-- use username and contact
      .exec();

    res.status(200).json(appointmentsWithPatients);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
}



module.exports = { getAllAppointments,getAppointmentById, scheduleAppointment, getAppointmentsByDoctor, updateAppointment, deleteAppointment, getAppointmentsByPatient,getAppointmentsByDoctor };