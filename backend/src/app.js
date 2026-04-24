const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/form');
const submissionRoutes = require('./routes/submissions');
const settingsRoutes = require('./routes/settings');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/form', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/settings', settingsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
