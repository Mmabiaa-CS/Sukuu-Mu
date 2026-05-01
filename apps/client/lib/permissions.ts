import { User, UserRole, Student, Class } from './types';
import { mockClassTeachers, mockTeachers } from './mock-data';

/**
 * Permission system for role-based access control
 * - Admin/Manager: Full access to all data
 * - Teacher: Access only to their assigned classes and students
 * - Student: View-only access to their own data
 */

export const canManageStudents = (user: User | null, targetClassId?: string): boolean => {
  if (!user) return false;
  
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return true;
  }
  
  if (user.role === UserRole.TEACHER && targetClassId) {
    // Teacher can only manage students in their assigned classes
    return isTeacherInClass(user.id, targetClassId);
  }
  
  return false;
};

export const canManageClasses = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
};

export const canManageTeachers = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
};

export const canManageSubjects = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
};

export const canManageFinances = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
};

export const canViewAttendance = (user: User | null, classId?: string): boolean => {
  if (!user) return false;
  
  // Admins and managers can view all attendance records
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return true;
  }
  
  // Teachers can only view attendance for their assigned classes
  if (user.role === UserRole.TEACHER && classId) {
    return isTeacherInClass(user.id, classId);
  }
  
  // If classId is not provided, check if user is a teacher at all
  if (user.role === UserRole.TEACHER) {
    return true;
  }
  
  return false;
};

export const canRecordAttendance = (user: User | null, classId?: string): boolean => {
  if (!user) return false;
  
  // Only teachers can record attendance
  if (user.role === UserRole.TEACHER && classId) {
    return isTeacherInClass(user.id, classId);
  }
  
  // If classId is not provided, check if user is a teacher at all
  if (user.role === UserRole.TEACHER) {
    return true;
  }
  
  return false;
};

export const canViewFinances = (user: User | null, studentId?: string): boolean => {
  if (!user) return false;
  
  // Manager can view all finances
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return true;
  }
  
  // Student can only view their own finances
  if (user.role === UserRole.STUDENT && studentId === user.id) {
    return true;
  }
  
  // Teacher can view finances of students in their classes
  if (user.role === UserRole.TEACHER && studentId) {
    return isTeacherOfStudent(user.id, studentId);
  }
  
  return false;
};

export const canRecordPayment = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
};

/**
 * Get classes assigned to a teacher
 */
export const getTeacherClasses = (teacherId: string): string[] => {
  const assignments = mockClassTeachers.filter(ct => ct.teacherId === teacherId);
  return [...new Set(assignments.map(ct => ct.classId))];
};

/**
 * Get students in a specific teacher's classes
 */
export const getTeacherStudents = (teacherId: string, students: Student[]): Student[] => {
  const classIds = getTeacherClasses(teacherId);
  return students.filter(s => classIds.includes(s.classId));
};

/**
 * Check if a teacher is assigned to a specific class
 */
export const isTeacherInClass = (teacherId: string, classId: string): boolean => {
  return mockClassTeachers.some(ct => ct.teacherId === teacherId && ct.classId === classId);
};

/**
 * Check if a teacher teaches a specific student
 */
export const isTeacherOfStudent = (teacherId: string, studentId: string): boolean => {
  const teacher = mockTeachers.find(t => t.id === teacherId);
  const studentClass = getTeacherClasses(teacherId);
  // Check if student is in any of the teacher's classes
  return studentClass.length > 0;
};

/**
 * Filter students based on teacher's access
 */
export const filterStudentsByAccess = (user: User | null, students: Student[]): Student[] => {
  if (!user) return [];
  
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return students;
  }
  
  if (user.role === UserRole.TEACHER) {
    return getTeacherStudents(user.id, students);
  }
  
  return [];
};

/**
 * Filter classes based on teacher's access
 */
export const filterClassesByAccess = (user: User | null, classes: Class[]): Class[] => {
  if (!user) return [];
  
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return classes;
  }
  
  if (user.role === UserRole.TEACHER) {
    const classIds = getTeacherClasses(user.id);
    return classes.filter(c => classIds.includes(c.id));
  }
  
  return [];
};
