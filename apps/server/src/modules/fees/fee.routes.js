'use strict';

const express = require('express');
const router = express.Router();

const feeController = require('./fee.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Fee structures ─────────────────────────────────────────────────────────
/**
 * @openapi
 * /fees/structures:
 *   get:
 *     tags: [Fees]
 *     summary: Get all fee structures
 */
router.get('/structures',
  feeController.getAllStructures
);

/**
 * @openapi
 * /fees/structures/{id}:
 *   get:
 *     tags: [Fees]
 *     summary: Get single fee structure
 */
router.get('/structures/:id',
  feeController.getFeeStructureById
);

router.post('/structures',
  authorize('admin'),
  feeController.createFeeStructure
);

router.put('/structures/:id',
  authorize('admin'),
  feeController.updateFeeStructure
);

/**
 * @openapi
 * /fees/structures/{id}/assign-classes:
 *   post:
 *     tags: [Fees]
 *     summary: Bulk assign to classes
 */
router.post('/structures/:id/assign-classes',
  authorize('admin'),
  feeController.assignStructureToClasses
);

// ── Reports ────────────────────────────────────────────────────────────────
/**
 * @openapi
 * /fees/reports/summary:
 *   get:
 *     tags: [Fees]
 *     summary: Collection summary report
 */
router.get('/reports/summary',
  feeController.getFeeReport
);

/**
 * @openapi
 * /fees/reports/outstanding:
 *   get:
 *     tags: [Fees]
 *     summary: Outstanding balances report
 */
router.get('/reports/outstanding',
  feeController.getOutstandingReport
);

// ── Receipts ───────────────────────────────────────────────────────────────
/**
 * @openapi
 * /fees/receipts/{payment_id}:
 *   get:
 *     tags: [Fees]
 *     summary: Generate/get receipt
 */
router.get('/receipts/:payment_id',
  feeController.generateReceipt
);

/**
 * @openapi
 * /fees/receipts/{payment_id}/download:
 *   get:
 *     tags: [Fees]
 *     summary: Download receipt as PDF
 */
router.get('/receipts/:payment_id/download',
  feeController.downloadReceipt
);

// ── Student ledger ─────────────────────────────────────────────────────────
/**
 * @openapi
 * /fees/ledger/{student_id}:
 *   get:
 *     tags: [Fees]
 *     summary: Full fee ledger for student
 */
router.get('/ledger/:student_id',
  feeController.getStudentFeeLedger
);

// ── Payments ───────────────────────────────────────────────────────────────
/**
 * @openapi
 * /fees/student/{student_id}:
 *   get:
 *     tags: [Fees]
 *     summary: Payment history for student
 */
router.get('/student/:student_id',
  feeController.getStudentPayments
);

/**
 * @openapi
 * /fees:
 *   get:
 *     tags: [Fees]
 *     summary: All payments paginated
 */
router.get('/',
  feeController.getAllPayments
);

/**
 * @openapi
 * /fees/{id}:
 *   get:
 *     tags: [Fees]
 *     summary: Single payment
 */
router.get('/:id',
  feeController.getPaymentById
);

/**
 * @openapi
 * /fees/pay:
 *   post:
 *     tags: [Fees]
 *     summary: Record a payment
 */
router.post('/pay',
  authorize('admin', 'teacher'),
  feeController.recordPayment
);

router.put('/:id',
  authorize('admin'),
  feeController.updatePayment
);

router.delete('/:id',
  authorize('admin'),
  feeController.deletePayment
);

module.exports = router;