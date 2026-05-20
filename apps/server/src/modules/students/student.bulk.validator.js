'use strict';

// ── Reuses the same rules enforced by the single-student creation service ─
// No new libraries — same field constraints, same enum values, same logic

const VALID_GENDERS   = ['male', 'female', 'other'];
const VALID_RELATIONS = ['father', 'mother', 'guardian', 'other'];

// Same date regex used implicitly by MySQL DATE type
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Simple email regex — consistent with what MySQL accepts and what the rest
// of the system validates (no external validator library used elsewhere)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate a single student row.
// Returns an array of field-level error strings.
// Empty array = row is valid.
const validateRow = (row, rowIndex) => {
  const errors = [];
  const label  = `Row ${rowIndex}`;

  // ── Required student fields ──────────────────────────────────────────────
  if (!row.first_name || !String(row.first_name).trim()) {
    errors.push(`${label}: first_name is required`);
  }
  if (!row.last_name || !String(row.last_name).trim()) {
    errors.push(`${label}: last_name is required`);
  }
  if (!row.email || !String(row.email).trim()) {
    errors.push(`${label}: email is required`);
  } else if (!EMAIL_REGEX.test(String(row.email).trim())) {
    errors.push(`${label}: email "${row.email}" is not a valid email address`);
  }

  // ── Optional student fields with format constraints ───────────────────────
  if (row.gender && !VALID_GENDERS.includes(String(row.gender).toLowerCase())) {
    errors.push(`${label}: gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }
  if (row.date_of_birth && !DATE_REGEX.test(String(row.date_of_birth).trim())) {
    errors.push(`${label}: date_of_birth must be in YYYY-MM-DD format`);
  }
  if (row.enrollment_date && !DATE_REGEX.test(String(row.enrollment_date).trim())) {
    errors.push(`${label}: enrollment_date must be in YYYY-MM-DD format`);
  }
  if (row.class_id && isNaN(Number(row.class_id))) {
    errors.push(`${label}: class_id must be a number`);
  }

  // ── Parent validation — only if any parent field is provided ─────────────
  const hasParentData = !!(
    row.parent_first_name || row.parent_last_name ||
    row.parent_phone      || row.parent_email
  );

  if (hasParentData) {
    if (!row.parent_first_name || !String(row.parent_first_name).trim()) {
      errors.push(`${label}: parent_first_name is required when parent data is provided`);
    }
    if (!row.parent_last_name || !String(row.parent_last_name).trim()) {
      errors.push(`${label}: parent_last_name is required when parent data is provided`);
    }
    if (!row.parent_phone || !String(row.parent_phone).trim()) {
      errors.push(`${label}: parent_phone is required when parent data is provided`);
    }
    if (row.parent_email && !EMAIL_REGEX.test(String(row.parent_email).trim())) {
      errors.push(`${label}: parent_email "${row.parent_email}" is not valid`);
    }
    if (row.parent_gender && !VALID_GENDERS.includes(String(row.parent_gender).toLowerCase())) {
      errors.push(`${label}: parent_gender must be one of: ${VALID_GENDERS.join(', ')}`);
    }
    if (row.relation && !VALID_RELATIONS.includes(String(row.relation).toLowerCase())) {
      errors.push(`${label}: relation must be one of: ${VALID_RELATIONS.join(', ')}`);
    }
    if (row.is_primary !== undefined && row.is_primary !== '') {
      const val = Number(row.is_primary);
      if (isNaN(val) || (val !== 0 && val !== 1)) {
        errors.push(`${label}: is_primary must be 0 or 1`);
      }
    }
  }

  return errors;
};

// Detect in-batch duplicates (same email appearing more than once in the payload)
const detectInBatchDuplicates = (rows) => {
  const emailSeen = new Map();  // email → first row index
  const phoneSeen = new Map();  // parent_phone → first row index
  const duplicates = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2; // 1-based + header row
    const email  = row.email ? String(row.email).trim().toLowerCase() : null;
    const phone  = row.parent_phone ? String(row.parent_phone).trim() : null;

    if (email) {
      if (emailSeen.has(email)) {
        duplicates.push({
          row:     rowNum,
          field:   'email',
          value:   email,
          message: `Duplicate student email "${email}" — first seen on row ${emailSeen.get(email)}`,
        });
      } else {
        emailSeen.set(email, rowNum);
      }
    }

    if (phone) {
      if (phoneSeen.has(phone)) {
        duplicates.push({
          row:     rowNum,
          field:   'parent_phone',
          value:   phone,
          message: `Duplicate parent phone "${phone}" — first seen on row ${phoneSeen.get(phone)}`,
        });
      } else {
        phoneSeen.set(phone, rowNum);
      }
    }
  });

  return duplicates;
};

// Full validation pass over all rows.
// Returns { valid: [...], invalid: [...] }
// Each invalid entry carries its row number and errors array.
const validateAllRows = (rows) => {
  const valid   = [];
  const invalid = [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return { valid, invalid, duplicates: [] };
  }

  // In-batch duplicate check first
  const duplicates = detectInBatchDuplicates(rows);
  const dupRows    = new Set(duplicates.map(d => d.row));

  rows.forEach((row, i) => {
    const rowNumber = i + 2; // account for header row in file
    const errors    = validateRow(row, rowNumber);

    // Also flag rows that have in-batch duplicates
    if (dupRows.has(rowNumber)) {
      const dupErrors = duplicates
        .filter(d => d.row === rowNumber)
        .map(d => d.message);
      errors.push(...dupErrors);
    }

    if (errors.length > 0) {
      invalid.push({ row: rowNumber, data: row, errors });
    } else {
      valid.push({ row: rowNumber, data: row });
    }
  });

  return { valid, invalid, duplicates };
};

module.exports = { validateRow, validateAllRows, detectInBatchDuplicates };