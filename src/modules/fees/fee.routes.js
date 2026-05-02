'use strict';

const express = require('express');
const router  = express.Router();

const feeController = require('./fee.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Fee structures ─────────────────────────────────────────────────────────
router.get('/structures',
  feeController.getAllStructures
);

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

router.post('/structures/:id/assign-classes',
  authorize('admin'),
  feeController.assignStructureToClasses
);

// ── Reports ────────────────────────────────────────────────────────────────
router.get('/reports/summary',
  feeController.getFeeReport
);

router.get('/reports/outstanding',
  feeController.getOutstandingReport
);

// ── Receipts ───────────────────────────────────────────────────────────────
router.get('/receipts/:payment_id',
  feeController.generateReceipt
);

router.get('/receipts/:payment_id/download',
  feeController.downloadReceipt
);

// ── Student ledger ─────────────────────────────────────────────────────────
router.get('/ledger/:student_id',
  feeController.getStudentFeeLedger
);

// ── Payments ───────────────────────────────────────────────────────────────
router.get('/student/:student_id',
  feeController.getStudentPayments
);

router.get('/',
  feeController.getAllPayments
);

router.get('/:id',
  feeController.getPaymentById
);

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