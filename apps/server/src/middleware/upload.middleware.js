'use strict';

const multer = require('multer');
const path   = require('path');

// ── In-memory storage — no temp files on disk ──────────────────────────────
// Matches existing project pattern: no external file storage configured
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                           // .xls (fallback)
    'application/octet-stream',                                           // some OS send this for csv
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.csv', '.xlsx', '.xls'];

  if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
    return cb(null, true);
  }

  const err = new Error('Only .csv and .xlsx files are accepted for bulk upload');
  err.status = 400;
  cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB — same conservative limit used elsewhere
    files: 1,
  },
});

// Single file field named "file" — consistent with REST convention
const uploadSingle = upload.single('file');

// Wraps multer to emit structured errors matching existing error.middleware.js
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'File size exceeds 5 MB limit';
      err.status  = 400;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      err.message = 'Unexpected field — use field name "file"';
      err.status  = 400;
    } else {
      err.status = err.status || 400;
    }

    next(err);
  });
};

module.exports = { handleUpload };