'use strict';

const studentService = require('./student.service');

const getAllStudents = async (req, res, next) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const data = await studentService.getStudentById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: ?q=owusu',
      });
    }
    const result = await studentService.searchStudents(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const data = await studentService.createStudent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const data = await studentService.updateStudent(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    await studentService.deleteStudent(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  searchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};