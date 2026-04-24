const express = require('express');
const crypto = require('crypto');
const FormField = require('../models/FormField');
const FormSettings = require('../models/FormSettings');
const Submission = require('../models/Submission');
const { adminAuth, optionalAuth } = require('../middleware/auth');
const { validateSubmission } = require('../utils/validate');

const router = express.Router();

// Student: Submit registration
router.post('/', async (req, res) => {
  try {
    const settings = await FormSettings.findOne();
    if (!settings || !settings.registrationEnabled) {
      return res.status(403).json({ message: 'Registration is currently closed' });
    }

    const fields = await FormField.find({ active: true });
    const errors = validateSubmission(fields, req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const allowedFields = fields.map(f => f.name);
    const data = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const editToken = settings.allowStudentEdits
      ? crypto.randomBytes(32).toString('hex')
      : undefined;

    const submission = await Submission.create({ data, editToken });

    res.status(201).json({
      message: settings.successMessage || 'Registration submitted successfully!',
      submissionId: submission._id,
      editToken: editToken || undefined
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get own submission (with edit token)
router.get('/mine/:token', async (req, res) => {
  try {
    const submission = await Submission.findOne({ editToken: req.params.token });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Update own submission (with edit token)
router.put('/mine/:token', async (req, res) => {
  try {
    const settings = await FormSettings.findOne();
    if (!settings || !settings.allowStudentEdits) {
      return res.status(403).json({ message: 'Editing submissions is not allowed' });
    }

    const submission = await Submission.findOne({ editToken: req.params.token });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const fields = await FormField.find({ active: true });
    const errors = validateSubmission(fields, req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const allowedFields = fields.map(f => f.name);
    const data = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    submission.data = data;
    await submission.save();
    res.json({ message: 'Submission updated', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all submissions with search/filter
router.get('/', adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { 'data': { $regex: search, $options: 'i' } }
        ]
      };
      // Search within data fields
      const fields = await FormField.find({ active: true });
      const orConditions = fields.map(f => ({
        [`data.${f.name}`]: { $regex: search, $options: 'i' }
      }));
      if (orConditions.length > 0) {
        query = { $or: orConditions };
      }
    }

    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    const [submissions, total] = await Promise.all([
      Submission.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Submission.countDocuments(query)
    ]);

    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get single submission
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update submission
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.data = { ...submission.data, ...req.body.data };
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete submission
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Export submissions
router.get('/export/:format', adminAuth, async (req, res) => {
  try {
    const { format } = req.params;
    const submissions = await Submission.find().sort({ createdAt: -1 });
    const fields = await FormField.find({ active: true }).sort({ order: 1 });

    const rows = submissions.map(s => {
      const row = { 'Submission ID': s._id.toString(), 'Submitted At': s.createdAt };
      for (const field of fields) {
        const val = s.data[field.name];
        row[field.label] = Array.isArray(val) ? val.join(', ') : (val || '');
      }
      return row;
    });

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const parser = new Parser();
      const csv = parser.parse(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
      return res.send(csv);
    } else if (format === 'excel') {
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.xlsx');
      return res.send(buffer);
    }

    res.status(400).json({ message: 'Invalid format. Use csv or excel' });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
