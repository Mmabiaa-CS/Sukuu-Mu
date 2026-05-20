'use strict';

// ── Follows EXACT same pattern as student.controller.js ──────────────────
// - try/catch → next(err) for all errors
// - res.status().json({ success, message, data })
// - req.body / req.file / req.query only — no business logic here

const { parseUploadedFile, generateTemplate } = require('../../utils/bulk.parser.util');
const { previewBulkAdmission, executeBulkAdmission } = require('./student.bulk.service');

// ── GET /students/bulk/template ───────────────────────────────────────────
// Download a CSV template showing expected columns
const downloadTemplate = (req, res, next) => {
  try {
    const buffer = generateTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bulk_students_template.csv"');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// ── POST /students/bulk/preview — JSON body ───────────────────────────────
const previewFromJSON = async (req, res, next) => {
  try {
    const rows = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a JSON array of student objects',
      });
    }

    const data = await previewBulkAdmission(rows);

    return res.status(200).json({
      success: true,
      message: `Preview complete — ${data.summary.ready_to_import} row(s) ready to import`,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /students/bulk/preview/upload — file upload ─────────────────────
const previewFromFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded — attach a .csv or .xlsx file using the "file" field',
      });
    }

    const rows = parseUploadedFile(req.file);
    const data = await previewBulkAdmission(rows);

    return res.status(200).json({
      success: true,
      message: `File parsed — ${data.summary.ready_to_import} row(s) ready to import`,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /students/bulk/import — JSON body ────────────────────────────────
const importFromJSON = async (req, res, next) => {
  try {
    const rows = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a JSON array of student objects',
      });
    }

    // allow_partial query param: ?allow_partial=true
    const allow_partial = req.query.allow_partial === 'true';

    const data = await executeBulkAdmission(rows, { allow_partial });

    const status = data.success_count > 0 ? 201 : 422;

    return res.status(status).json({
      success: data.success_count > 0,
      message: data.message,
      data,
    });
  } catch (err) {
    // Attach structured details to the response if service threw them
    if (err.details) {
      return res.status(err.status || 422).json({
        success: false,
        message: err.message,
        data:    err.details,
      });
    }
    next(err);
  }
};

// ── POST /students/bulk/import/upload — file upload ───────────────────────
const importFromFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded — attach a .csv or .xlsx file using the "file" field',
      });
    }

    const rows          = parseUploadedFile(req.file);
    const allow_partial = req.query.allow_partial === 'true';
    const data          = await executeBulkAdmission(rows, { allow_partial });

    const status = data.success_count > 0 ? 201 : 422;

    return res.status(status).json({
      success: data.success_count > 0,
      message: data.message,
      data,
    });
  } catch (err) {
    if (err.details) {
      return res.status(err.status || 422).json({
        success: false,
        message: err.message,
        data:    err.details,
      });
    }
    next(err);
  }
};

module.exports = {
  downloadTemplate,
  previewFromJSON,
  previewFromFile,
  importFromJSON,
  importFromFile,
};