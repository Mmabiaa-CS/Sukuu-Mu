import { useState, useCallback } from 'react';
import { Class } from './types';
import { mockClasses, mockStudents } from './mock-data';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter((cls) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cls.name.toLowerCase().includes(searchLower) ||
      cls.code.toLowerCase().includes(searchLower)
    );
  });

  const addClass = useCallback((cls: Omit<Class, 'id' | 'createdAt'>) => {
    const newClass: Class = {
      ...cls,
      id: `class-${Date.now()}`,
      createdAt: new Date()
    };
    setClasses((prev) => [...prev, newClass]);
    return newClass;
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<Class>) => {
    setClasses((prev) =>
      prev.map((cls) =>
        cls.id === id ? { ...cls, ...updates } : cls
      )
    );
  }, []);

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== id));
  }, []);

  const getStudentsInClass = useCallback(
    (classId: string) => {
      return mockStudents.filter((s) => s.classId === classId);
    },
    []
  );

  const getClassFillPercentage = useCallback(
    (classId: string) => {
      const cls = classes.find((c) => c.id === classId);
      if (!cls) return 0;
      const students = getStudentsInClass(classId);
      return Math.round((students.length / cls.capacity) * 100);
    },
    [classes, getStudentsInClass]
  );

  return {
    classes,
    filteredClasses,
    searchTerm,
    setSearchTerm,
    addClass,
    updateClass,
    deleteClass,
    getStudentsInClass,
    getClassFillPercentage
  };
}
