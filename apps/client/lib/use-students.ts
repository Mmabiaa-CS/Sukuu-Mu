import { useState, useCallback } from 'react';
import { Student } from './types';
import { mockStudents, mockClasses } from './mock-data';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.id.toLowerCase().includes(searchLower)
    );
  });

  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}`
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, ...updates } : student
      )
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
  }, []);

  const getStudentsByClass = useCallback(
    (classId: string) => {
      return students.filter((student) => student.classId === classId);
    },
    [students]
  );

  const getClassName = useCallback((classId: string) => {
    const classItem = mockClasses.find((c) => c.id === classId);
    return classItem?.name || 'Unknown Class';
  }, []);

  return {
    students,
    filteredStudents,
    searchTerm,
    setSearchTerm,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    getClassName
  };
}
