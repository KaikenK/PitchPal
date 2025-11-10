const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const founderRoutes = require('./routes/founder');
const investorRoutes = require('./routes/investor');
const adminRoutes = require('./routes/admin');
const fundingRoutes = require('./routes/funding');
const domainRoutes = require('./routes/domain');
const startupRoutes = require('./routes/startup');
const pitchMatchRoutes = require('./routes/pitchmatch');
const messageRoutes = require('./routes/message');
const analyticsRoutes = require('./routes/analytics');

// API Routes
app.use('/api/founder', founderRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/domain', domainRoutes);
app.use('/api/startup', startupRoutes);
app.use('/api/pitchmatch', pitchMatchRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PitchPal API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to PitchPal API',
    version: '1.0.0',
    endpoints: {
      founder: '/api/founder',
      investor: '/api/investor',
      admin: '/api/admin',
      funding: '/api/funding',
      domain: '/api/domain',
      startup: '/api/startup',
      pitchmatch: '/api/pitchmatch',
      message: '/api/message',
      analytics: '/api/analytics'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
