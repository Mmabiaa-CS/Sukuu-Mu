import { User, UserRole, Student, Class } from './types';
// Note: In a real app, these would come from the API/Cache, keeping empty for now or linking to real data
const mockClassTeachers: any[] = [];

/**
 * Permission system for role-based access control
 * - Admin/Manager: Full access to all data
 * - Teacher: Access only to their assigned classes and students
 * - Student: View-only access to their own data
 */

export const canManageStudents = (user: User | null, targetClassId?: number | string): boolean => {
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager') {
    return true;
  }

  if (user.role === UserRole.TEACHER && targetClassId) {
    return isTeacherInClass(user.id, targetClassId);
  }

  return false;
};

export const canManageClasses = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager';
};

export const canManageTeachers = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager';
};

export const canManageSubjects = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager';
};

export const canManageFinances = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager';
};

export const canViewAttendance = (user: User | null, classId?: number | string): boolean => {
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager') {
    return true;
  }

  if (user.role === UserRole.TEACHER && classId) {
    return isTeacherInClass(user.id, classId);
  }

  if (user.role === UserRole.TEACHER) {
    return true;
  }

  return false;
};

export const canRecordAttendance = (user: User | null, classId?: number | string): boolean => {
  if (!user) return false;

  if (user.role === UserRole.TEACHER && classId) {
    return isTeacherInClass(user.id, classId);
  }

  if (user.role === UserRole.TEACHER) {
    return true;
  }

  return false;
};

export const canViewFinances = (user: User | null, studentId?: number | string): boolean => {
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager') {
    return true;
  }

  if (user.role === UserRole.STUDENT && String(studentId) === String(user.id)) {
    return true;
  }

  if (user.role === UserRole.TEACHER && studentId) {
    return isTeacherOfStudent(user.id, studentId);
  }

  return false;
};

export const canRecordPayment = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager';
};

/**
 * Get classes assigned to a teacher
 */
export const getTeacherClasses = (teacherId: number | string): (number | string)[] => {
  const assignments = mockClassTeachers.filter(ct => String(ct.teacherId) === String(teacherId));
  return [...new Set(assignments.map(ct => ct.classId))];
};

/**
 * Get students in a specific teacher's classes
 */
export const getTeacherStudents = (teacherId: number | string, students: Student[]): Student[] => {
  const classIds = getTeacherClasses(teacherId).map(id => String(id));
  return students.filter(s => classIds.includes(String(s.class_id)));
};

/**
 * Check if a teacher is assigned to a specific class
 */
export const isTeacherInClass = (teacherId: number | string, classId: number | string): boolean => {
  return mockClassTeachers.some(ct => String(ct.teacherId) === String(teacherId) && String(ct.classId) === String(classId));
};

/**
 * Check if a teacher teaches a specific student
 */
export const isTeacherOfStudent = (teacherId: number | string, studentId: number | string): boolean => {
  // In a real app we'd check assignments, for now allow if they have any classes
  return getTeacherClasses(teacherId).length > 0;
};

/**
 * Filter students based on teacher's access
 */
export const filterStudentsByAccess = (user: User | null, students: Student[]): Student[] => {
  if (!user) return [];

  if (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager') {
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

  if (user.role === UserRole.ADMIN || user.role === 'admin' || user.role === 'manager') {
    return classes;
  }

  if (user.role === UserRole.TEACHER) {
    const classIds = getTeacherClasses(user.id).map(id => String(id));
    return classes.filter(c => classIds.includes(String(c.id)));
  }

  return [];
};
