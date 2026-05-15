'use strict';

const feeService = require('./fee.service');

const getAllStructures = async (req, res, next) => {
  try {
    const data = await feeService.getAllStructures();
    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const createFeeStructure = async (req, res, next) => {
  try {
    const data = await feeService.createFeeStructure(req.body);
    return res.status(201).json({
      success: true,
      message: 'Fee structure created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getFeeStructureById = async (req, res, next) => {
  try {
    const data = await feeService.getFeeStructureById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateFeeStructure = async (req, res, next) => {
  try {
    const data = await feeService.updateFeeStructure(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Fee structure updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const result = await feeService.getAllPayments(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const data = await feeService.getPaymentById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getStudentPayments = async (req, res, next) => {
  try {
    const data = await feeService.getStudentPayments(Number(req.params.student_id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const data = await feeService.recordPayment(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const data = await feeService.updatePayment(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Payment updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    await feeService.deletePayment(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const assignStructureToClasses = async (req, res, next) => {
  try {
    const structure_id = Number(req.params.id);
    const data = await feeService.assignStructureToClasses(structure_id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAllStudentFees = async (req, res, next) => {
  try {
    const data = await feeService.getAllStudentFees();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getStudentFeeLedger = async (req, res, next) => {
  try {
    const data = await feeService.getStudentFeeLedger(Number(req.params.student_id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const generateReceipt = async (req, res, next) => {
  try {
    const payment_id = Number(req.params.payment_id);
    const data = await feeService.generateReceipt(payment_id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const downloadReceipt = async (req, res, next) => {
  try {
    const payment_id = Number(req.params.payment_id);
    const receipt = await feeService.generateReceipt(payment_id);

    if (!receipt.file_path) {
      return res.status(404).json({ success: false, message: 'Receipt file not found' });
    }

    return res.download(receipt.file_path, `${receipt.receipt_no}.pdf`, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};

const getFeeReport = async (req, res, next) => {
  try {
    const { academic_year, term, class_id } = req.query;
    const data = await feeService.getFeeReport({ academic_year, term, class_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getOutstandingReport = async (req, res, next) => {
  try {
    const { academic_year, term, class_id } = req.query;
    const data = await feeService.getOutstandingReport({ academic_year, term, class_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStructures,
  updateFeeStructure,
  assignStructureToClasses,
  getAllStudentFees,
  getStudentFeeLedger,
  getFeeStructureById,
  createFeeStructure,
  getAllPayments,
  getPaymentById,
  getStudentPayments,
  recordPayment,
  updatePayment,
  deletePayment,
  generateReceipt,
  downloadReceipt,
  getFeeReport,
  getOutstandingReport
};