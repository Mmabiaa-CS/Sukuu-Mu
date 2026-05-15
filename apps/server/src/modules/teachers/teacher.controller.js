'use strict';

const teacherService = require('./teacher.service');

const getAllTeachers = async (req, res, next) => {
  try {
    const result = await teacherService.getAllTeachers(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const data = await teacherService.getTeacherById(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const searchTeachers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required. Example: ?q=john',
      });
    }
    const result = await teacherService.searchTeachers(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.createTeacher(req.body);
    return res.status(201).json({
      success: true,
      message: 'Teacher created successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.updateTeacher(Number(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    await teacherService.deleteTeacher(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const assignClassToTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.assignClassToTeacher(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const removeClassFromTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.removeClassFromTeacher(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const assignSubjectToTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.assignSubjectToTeacher(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const removeSubjectFromTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.removeSubjectFromTeacher(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getTeacherClasses = async (req, res, next) => {
  try {
    const data = await teacherService.getTeacherClasses(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getTeacherSubjects = async (req, res, next) => {
  try {
    const data = await teacherService.getTeacherSubjects(Number(req.params.id));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  searchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignClassToTeacher,
  removeClassFromTeacher,
  assignSubjectToTeacher,
  removeSubjectFromTeacher,
  getTeacherClasses,
  getTeacherSubjects,
};