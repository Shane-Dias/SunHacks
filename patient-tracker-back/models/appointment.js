const mongoose = require('mongoose');


const appointmentSchema = new mongoose.Schema({
   patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
   date: { type: Date, required: true },
   purpose: { type: String, required: true },
});


module.exports = mongoose.model('Appointment', appointmentSchema);