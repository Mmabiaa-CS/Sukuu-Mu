'use strict';

const attendanceRepository = require('./attendance.repository');

const recordBulkAttendance = async (records) => {
    const promises = records.map(record => attendanceRepository.recordAttendance(record));
    return await Promise.all(promises);
};

const getClassAttendance = async (class_id, date) => {
    return await attendanceRepository.getAttendanceByClass(class_id, date);
};

const getStudentAttendance = async (student_id) => {
    return await attendanceRepository.getAttendanceByStudent(student_id);
};

const getStudentStats = async (student_id) => {
    const stats = await attendanceRepository.getAttendanceStats(student_id);
    const total = parseInt(stats.total) || 0;
    const present = parseInt(stats.present) || 0;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { ...stats, percentage };
};

module.exports = {
    recordBulkAttendance,
    getClassAttendance,
    getStudentAttendance,
    getStudentStats
};
