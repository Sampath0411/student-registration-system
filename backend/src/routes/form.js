const express = require('express');
const FormField = require('../models/FormField');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all form fields (public - for student form rendering)
router.get('/fields', async (req, res) => {
  try {
    const fields = await FormField.find({ active: true }).sort({ order: 1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all fields including inactive (admin only)
router.get('/fields/all', adminAuth, async (req, res) => {
  try {
    const fields = await FormField.find().sort({ order: 1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new form field
router.post('/fields', adminAuth, async (req, res) => {
  try {
    const { label, name, type, required, placeholder, options, validation, active } = req.body;

    if (!label || !name || !type) {
      return res.status(400).json({ message: 'Label, name, and type are required' });
    }

    const existing = await FormField.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'A field with this name already exists' });
    }

    const maxOrder = await FormField.findOne().sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const field = await FormField.create({
      label, name, type, required: required || false,
      placeholder: placeholder || '', options: options || [],
      validation: validation || {}, order, active: active !== false
    });

    res.status(201).json(field);
  } catch (err) {
    console.error('Create field error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a form field
router.put('/fields/:id', adminAuth, async (req, res) => {
  try {
    const field = await FormField.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.json(field);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder fields
router.put('/fields/reorder', adminAuth, async (req, res) => {
  try {
    const { fieldOrders } = req.body; // [{id, order}]
    if (!Array.isArray(fieldOrders)) {
      return res.status(400).json({ message: 'fieldOrders array is required' });
    }

    const ops = fieldOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } }
      }
    }));

    await FormField.bulkWrite(ops);
    const fields = await FormField.find().sort({ order: 1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a form field
router.delete('/fields/:id', adminAuth, async (req, res) => {
  try {
    const field = await FormField.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.json({ message: 'Field deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
