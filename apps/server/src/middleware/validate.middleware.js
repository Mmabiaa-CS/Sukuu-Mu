'use strict';

const { validationResult } = require('express-validator');

const validate = (schemas) => {
  return async (req, res, next) => {
    // Run all validation rules
    await Promise.all(schemas.map((schema) => schema.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  };
};

module.exports = { validate };