'use strict';

const { pool } = require('../../database/connection');

const recordAttendance = async ({ student_id, class_id, date, status, remarks }) => {
    const [result] = await pool.execute(
        `INSERT INTO attendance (student_id, class_id, date, status, remarks)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), recorded_at = NOW()`,
        [student_id, class_id, date, status, remarks]
    );
    return result.insertId;
};

const getAttendanceByClass = async (class_id, date) => {
    const [rows] = await pool.execute(
        `SELECT a.*, s.first_name, s.last_name 
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.class_id = ? AND a.date = ?`,
        [class_id, date]
    );
    return rows;
};

const getAttendanceByStudent = async (student_id) => {
    const [rows] = await pool.execute(
        `SELECT a.*, c.name as class_name 
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.student_id = ?
     ORDER BY a.date DESC`,
        [student_id]
    );
    return rows;
};

const getAttendanceStats = async (student_id) => {
    const [rows] = await pool.execute(
        `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
     FROM attendance
     WHERE student_id = ?`,
        [student_id]
    );
    return rows[0];
};

module.exports = {
    recordAttendance,
    getAttendanceByClass,
    getAttendanceByStudent,
    getAttendanceStats
};
