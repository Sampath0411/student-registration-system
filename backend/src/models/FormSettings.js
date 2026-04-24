const mongoose = require('mongoose');

const formSettingsSchema = new mongoose.Schema({
  formTitle: { type: String, default: 'Student Registration' },
  formDescription: { type: String, default: 'Please fill out the registration form below.' },
  registrationEnabled: { type: Boolean, default: true },
  allowStudentEdits: { type: Boolean, default: false },
  successMessage: { type: String, default: 'Registration submitted successfully!' }
}, { timestamps: true });

module.exports = mongoose.model('FormSettings', formSettingsSchema);
