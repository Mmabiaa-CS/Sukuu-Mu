import { useState } from 'react';
import { Attendance } from './types';
import { mockAttendance } from './mock-data';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);

  const addAttendance = (record: Omit<Attendance, 'id' | 'recordedAt'>) => {
    const newRecord: Attendance = {
      ...record,
      id: `att-${Date.now()}`,
      recordedAt: new Date()
    };
    setAttendance([...attendance, newRecord]);
    return newRecord;
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance(attendance.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAttendance = (id: string) => {
    setAttendance(attendance.filter(a => a.id !== id));
  };

  const getClassAttendance = (classId: string, date?: Date) => {
    return attendance.filter(a => {
      if (a.classId !== classId) return false;
      if (date) {
        const recordDate = new Date(a.date);
        return recordDate.toDateString() === date.toDateString();
      }
      return true;
    });
  };

  const getStudentAttendance = (studentId: string, classId?: string) => {
    return attendance.filter(a => {
      if (a.studentId !== studentId) return false;
      if (classId && a.classId !== classId) return false;
      return true;
    });
  };

  const getAttendanceStats = (studentId: string, classId?: string) => {
    const records = getStudentAttendance(studentId, classId);
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, percentage };
  };

  const recordBulkAttendance = (records: Omit<Attendance, 'id' | 'recordedAt'>[]) => {
    const newRecords = records.map(record => ({
      ...record,
      id: `att-${Date.now()}-${Math.random()}`,
      recordedAt: new Date()
    }));
    setAttendance([...attendance, ...newRecords]);
    return newRecords;
  };

  return {
    attendance,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    getClassAttendance,
    getStudentAttendance,
    getAttendanceStats,
    recordBulkAttendance
  };
};
