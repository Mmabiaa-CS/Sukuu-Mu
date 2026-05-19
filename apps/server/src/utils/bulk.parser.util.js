'use strict';

const Papa = require('papaparse');
const XLSX  = require('xlsx');
const path  = require('path');

// ── Expected column headers (case-insensitive, trimmed) ───────────────────
// Maps flexible header names → internal field names used by createStudent
const COLUMN_MAP = {
  // Student fields
  'first_name':       'first_name',
  'firstname':        'first_name',
  'first name':       'first_name',
  'last_name':        'last_name',
  'lastname':         'last_name',
  'last name':        'last_name',
  'email':            'email',
  'phone':            'phone',
  'gender':           'gender',
  'date_of_birth':    'date_of_birth',
  'dob':              'date_of_birth',
  'date of birth':    'date_of_birth',
  'address':          'address',
  'enrollment_date':  'enrollment_date',
  'enrollment date':  'enrollment_date',
  'class_id':         'class_id',
  'class id':         'class_id',
  'class_name':       'class_name',
  'class name':       'class_name',
  'class':            'class_name',

  // Parent fields
  'parent_first_name':    'parent_first_name',
  'parent firstname':     'parent_first_name',
  'parent first name':    'parent_first_name',
  'parent_last_name':     'parent_last_name',
  'parent lastname':      'parent_last_name',
  'parent last name':     'parent_last_name',
  'parent_email':         'parent_email',
  'parent email':         'parent_email',
  'parent_phone':         'parent_phone',
  'parent phone':         'parent_phone',
  'parent_gender':        'parent_gender',
  'parent gender':        'parent_gender',
  'parent_occupation':    'parent_occupation',
  'parent occupation':    'parent_occupation',
  'parent_address':       'parent_address',
  'parent address':       'parent_address',
  'relation':             'relation',
  'relationship':         'relation',
  'is_primary':           'is_primary',
  'primary contact':      'is_primary',
};

// Normalise a raw header string to its internal field name
const normaliseHeader = (h) => {
  if (!h) return null;
  const key = String(h).trim().toLowerCase();
  return COLUMN_MAP[key] || null;
};

// Normalise a single raw row object (keys from file) → internal field object
const normaliseRow = (rawRow) => {
  const out = {};
  for (const [rawKey, value] of Object.entries(rawRow)) {
    const field = normaliseHeader(rawKey);
    if (field && value !== undefined && value !== null && String(value).trim() !== '') {
      out[field] = String(value).trim();
    }
  }
  return out;
};

// Parse CSV buffer → array of normalised row objects
const parseCSV = (buffer) => {
  const text   = buffer.toString('utf-8');
  const result = Papa.parse(text, {
    header:           true,
    skipEmptyLines:   true,
    transformHeader:  h => h,  // keep original — we normalise per-row
    dynamicTyping:    false,   // keep everything as string — we validate types ourselves
  });

  if (result.errors && result.errors.length > 0) {
    const fatal = result.errors.filter(e => e.type === 'Delimiter' || e.type === 'Quotes');
    if (fatal.length > 0) {
      const err = new Error(`CSV parse error on row ${fatal[0].row + 1}: ${fatal[0].message}`);
      err.status = 400;
      throw err;
    }
  }

  return (result.data || []).map(normaliseRow);
};

// Parse XLSX buffer → array of normalised row objects
const parseXLSX = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    const err = new Error('XLSX file contains no sheets');
    err.status = 400;
    throw err;
  }

  const sheet = workbook.Sheets[sheetName];
  const raw   = XLSX.utils.sheet_to_json(sheet, {
    defval:  '',
    raw:     false, // format dates as strings
    dateNF:  'YYYY-MM-DD',
  });

  return raw.map(normaliseRow);
};

// Main entry — detect format from originalname and dispatch
const parseUploadedFile = (file) => {
  if (!file || !file.buffer) {
    const err = new Error('No file buffer found — ensure Content-Type is multipart/form-data');
    err.status = 400;
    throw err;
  }

  const ext = path.extname(file.originalname || '').toLowerCase();

  if (ext === '.csv' || file.mimetype === 'text/csv') {
    return parseCSV(file.buffer);
  }

  if (ext === '.xlsx' || ext === '.xls' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel') {
    return parseXLSX(file.buffer);
  }

  const err = new Error(`Unsupported file type: ${ext || file.mimetype}`);
  err.status = 400;
  throw err;
};

// Generate a downloadable CSV template buffer
const generateTemplate = () => {
  const headers = [
    'first_name', 'last_name', 'email', 'phone',
    'gender', 'date_of_birth', 'address', 'enrollment_date',
    'class_name',
    'parent_first_name', 'parent_last_name', 'parent_phone',
    'parent_email', 'parent_gender', 'parent_occupation', 'parent_address',
    'relation', 'is_primary',
  ];

  const example = [
    'Jane', 'Smith', 'jane.smith@school.com', '0241234567',
    'female', '2005-03-15', '123 Accra Road', '2025-09-01',
    'Grade 10A',
    'Kweku', 'Smith', '0559876543',
    'kweku.smith@email.com', 'male', 'Engineer', '123 Accra Road',
    'father', '1',
  ];

  const csv = [headers.join(','), example.join(',')].join('\n');
  return Buffer.from(csv, 'utf-8');
};

module.exports = { parseUploadedFile, generateTemplate };