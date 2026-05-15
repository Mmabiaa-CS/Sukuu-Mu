'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// ── CORS — must come before everything else, including helmet ─────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const err = new Error(`CORS: Origin "${origin}" not allowed`);
    err.status = 403;
    return callback(err);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // let CORS headers through
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Documentation ──────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

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

//attendance routes
const attendanceRoutes = require('./modules/attendance/attendance.routes');
app.use('/api/v1/attendance', attendanceRoutes);

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