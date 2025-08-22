const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   username: { type: String, required: true },
   email: { type: String, unique: true, required: true },
   password: { type: String, required: true },
   role: { type: String, enum: ['doctor', 'patient'], required: true },
   // For patients, we'll store reference to their patient record
   patientRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
   }
});

// Pre-save hook to hash the password
userSchema.pre('save', async function(next) {
   if (this.isModified('password')) {
       this.password = await bcrypt.hash(this.password, 8);
   }
   next();
});

module.exports = mongoose.model('User', userSchema);