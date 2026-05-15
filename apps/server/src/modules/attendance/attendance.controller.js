'use strict';

const attendanceService = require('./attendance.service');

const recordAttendance = async (req, res, next) => {
    try {
        const { records } = req.body; // Array of { student_id, class_id, date, status, remarks }
        if (!Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Records must be an array' });
        }
        await attendanceService.recordBulkAttendance(records);
        res.status(200).json({ success: true, message: 'Attendance recorded successfully' });
    } catch (err) {
        next(err);
    }
};

const getClassAttendance = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        const data = await attendanceService.getClassAttendance(classId, date);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getStudentAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const data = await attendanceService.getStudentAttendance(studentId);
        const stats = await attendanceService.getStudentStats(studentId);
        res.status(200).json({ success: true, data, stats });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    recordAttendance,
    getClassAttendance,
    getStudentAttendance
};
