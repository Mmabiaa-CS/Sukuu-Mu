'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ── Security & parsing middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// At the top with other requires
const { logger } = require('./middleware/logger.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');

//parents routes
const parentRoutes = require('./modules/parents/parent.routes');
app.use('/api/v1/parents', parentRoutes);

//fees routes
const feeRoutes = require('./modules/fees/fee.routes');
app.use('/api/v1/fees', feeRoutes);

//teachers routes
const teacherRoutes = require('./modules/teachers/teacher.routes');
app.use('/api/v1/teachers', teacherRoutes);

//subjects routes
const subjectRoutes = require('./modules/subjects/subject.routes');
app.use('/api/v1/subjects', subjectRoutes);

//classes routes 
const classRoutes = require('./modules/classes/class.routes');
app.use('/api/v1/classes', classRoutes);


//students routes 
const studentRoutes = require('./modules/students/student.routes');
app.use('/api/v1/students', studentRoutes);

// After your middleware block, before the 404 handler
app.use('/api/v1/auth', authRoutes);

// ── HTTP request logger ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(logger);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);
module.exports = app;