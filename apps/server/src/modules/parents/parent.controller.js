'use strict';

const parentService = require('./parent.service');

const getAllParents = async (req, res, next) => {
  try {
    const result = await parentService.getAllParents(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getParentById = async (req, res, next) => {
  try {
    const data = await parentService.getParentById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const searchParents = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: ?q=owusu',
      });
    }
    const result = await parentService.searchParents(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createParent = async (req, res, next) => {
  try {
    const data = await parentService.createParent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Parent created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updateParent = async (req, res, next) => {
  try {
    const data = await parentService.updateParent(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Parent updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteParent = async (req, res, next) => {
  try {
    await parentService.deleteParent(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Parent deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const linkStudentToParent = async (req, res, next) => {
  try {
    const data = await parentService.linkStudentToParent(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const unlinkStudentFromParent = async (req, res, next) => {
  try {
    const data = await parentService.unlinkStudentFromParent(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getStudentsByParent = async (req, res, next) => {
  try {
    const data = await parentService.getStudentsByParent(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getParentsByStudent = async (req, res, next) => {
  try {
    const data = await parentService.getParentsByStudent(Number(req.params.student_id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllParents,
  getParentById,
  searchParents,
  createParent,
  updateParent,
  deleteParent,
  linkStudentToParent,
  unlinkStudentFromParent,
  getStudentsByParent,
  getParentsByStudent,
};