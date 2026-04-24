const mongoose = require('mongoose');

const validationSchema = new mongoose.Schema({
  minLength: { type: Number },
  maxLength: { type: Number },
  min: { type: Number },
  max: { type: Number },
  pattern: { type: String },
  patternMessage: { type: String }
}, { _id: false });

const formFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'dropdown', 'radio', 'checkbox', 'date', 'textarea']
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  options: [{ type: String }],
  validation: { type: validationSchema, default: {} },
  order: { type: Number, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

formFieldSchema.index({ order: 1 });

module.exports = mongoose.model('FormField', formFieldSchema);
