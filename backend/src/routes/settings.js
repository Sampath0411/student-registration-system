const express = require('express');
const FormSettings = require('../models/FormSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get form settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await FormSettings.findOne();
    if (!settings) {
      settings = await FormSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update form settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const allowedFields = ['formTitle', 'formDescription', 'registrationEnabled', 'allowStudentEdits', 'successMessage'];
    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    let settings = await FormSettings.findOne();
    if (!settings) {
      settings = await FormSettings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
