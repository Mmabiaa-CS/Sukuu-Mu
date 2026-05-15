import { useState, useCallback } from 'react';
import { Teacher } from './types';
import { mockTeachers, mockSubjects } from './mock-data';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower)
    );
  });

  const addTeacher = useCallback((teacher: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: `teacher-${Date.now()}`
    };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  }, []);

  const updateTeacher = useCallback((id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === id ? { ...teacher, ...updates } : teacher
      )
    );
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  }, []);

  const getTeacherSubjects = useCallback((subjectIds: string[]) => {
    return subjectIds
      .map((id) => mockSubjects.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => s?.name || '');
  }, []);

  return {
    teachers,
    filteredTeachers,
    searchTerm,
    setSearchTerm,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherSubjects
  };
}
