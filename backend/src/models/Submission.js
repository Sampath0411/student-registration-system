const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  editToken: { type: String, unique: true, sparse: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

submissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
