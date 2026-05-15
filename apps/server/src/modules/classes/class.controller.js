'use strict';

const classService = require('./class.service');

const getAllClasses = async (req, res, next) => {
  try {
    const result = await classService.getAllClasses(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const data = await classService.getClassById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getStudentsByClass = async (req, res, next) => {
  try {
    const data = await classService.getStudentsByClass(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const data = await classService.createClass(req.body);
    return res.status(201).json({
      success: true,
      message: 'Class created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const data = await classService.updateClass(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Class updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    await classService.deleteClass(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Class deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const migrateStudents = async (req, res, next) => {
  try {
    const fromClassId = Number(req.params.id);
    const { to_class_id } = req.body;

    if (!to_class_id) {
      return res.status(400).json({
        success: false,
        message: 'to_class_id is required in the request body.',
      });
    }

    const data = await classService.migrateStudentsToClass(
      fromClassId,
      Number(to_class_id)
    );

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const searchClasses = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: ?q=grade',
      });
    }

    const result = await classService.searchClasses(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  getStudentsByClass,
  createClass,
  updateClass,
  deleteClass,
  migrateStudents,
  searchClasses
};