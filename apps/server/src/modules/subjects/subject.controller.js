'use strict';

const subjectService = require('./subject.service');

const getAllSubjects = async (req, res, next) => {
  try {
    const result = await subjectService.getAllSubjects(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const data = await subjectService.getSubjectById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const searchSubjects = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: ?q=math',
      });
    }

    const result = await subjectService.searchSubjects(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const lookupSubject = async (req, res, next) => {
  try {
    const { name, code } = req.query;
    const data = await subjectService.lookupSubject({ name, code });
    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const data = await subjectService.createSubject(req.body);
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const data = await subjectService.updateSubject(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    await subjectService.deleteSubject(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const assignSubjectToClass = async (req, res, next) => {
  try {
    const data = await subjectService.assignSubjectToClass(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const removeSubjectFromClass = async (req, res, next) => {
  try {
    const data = await subjectService.removeSubjectFromClass(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getSubjectsByClass = async (req, res, next) => {
  try {
    const data = await subjectService.getSubjectsByClass(Number(req.params.class_id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  searchSubjects,
  lookupSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  assignSubjectToClass,
  removeSubjectFromClass,
  getSubjectsByClass,
};